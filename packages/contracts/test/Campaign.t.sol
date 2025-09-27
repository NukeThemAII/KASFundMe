// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CampaignFactory} from "../src/CampaignFactory.sol";
import {Campaign} from "../src/Campaign.sol";
import {
    ZeroContribution,
    DeadlineReached,
    GoalNotReached,
    RefundUnavailable,
    NothingToRefund,
    Unauthorized
} from "../src/CampaignErrors.sol";

contract CampaignTest is Test {
    CampaignFactory internal factory;
    Campaign internal campaign;

    address internal owner = address(this);
    address internal feeRecipient = address(0xFEE);
    address internal creator = address(0xC0FFEE);
    address internal beneficiary = address(0xBEEF);
    address internal contributor = address(0xCAFE);
    address internal other = address(0xD1CE);

    uint128 internal constant GOAL = 10 ether;
    string internal constant URI = "ipfs://cid";

    function setUp() public {
        factory = new CampaignFactory(feeRecipient);

        vm.label(owner, "Owner");
        vm.label(feeRecipient, "FeeRecipient");
        vm.label(creator, "Creator");
        vm.label(beneficiary, "Beneficiary");
        vm.label(contributor, "Contributor");
        vm.label(other, "Other");

        uint64 deadline = uint64(block.timestamp + 7 days);

        vm.prank(creator);
        address campaignAddress = factory.createCampaign(beneficiary, GOAL, deadline, URI);
        campaign = Campaign(payable(campaignAddress));
    }

    function testCreateCampaignInitializesState() public {
        assertTrue(factory.isCampaign(address(campaign)));
        assertEq(campaign.factory(), address(factory));
        assertEq(campaign.creator(), creator);
        assertEq(campaign.beneficiary(), beneficiary);
        assertEq(campaign.goal(), GOAL);
        assertEq(campaign.metadataUri(), URI);
        assertEq(uint8(campaign.status()), uint8(Campaign.Status.Active));
    }

    function testContributeAccruesFeeAndRaised() public {
        vm.deal(contributor, 5 ether);

        vm.prank(contributor);
        campaign.contribute{value: 5 ether}();

        assertEq(campaign.raised(), 5 ether);
        // 5 ether * 100 / 10_000 = 0.05 ether
        assertEq(campaign.feeAccrued(), 0.05 ether);
        assertEq(campaign.contributionOf(contributor), 5 ether);
    }

    function testContributeAfterDeadlineReverts() public {
        vm.warp(block.timestamp + 8 days);
        vm.deal(contributor, 1 ether);

        vm.prank(contributor);
        vm.expectRevert(DeadlineReached.selector);
        campaign.contribute{value: 1 ether}();
    }

    function testContributeZeroReverts() public {
        vm.prank(contributor);
        vm.expectRevert(ZeroContribution.selector);
        campaign.contribute{value: 0}();
    }

    function testFinalizeTransfersFunds() public {
        vm.deal(contributor, GOAL);

        vm.prank(contributor);
        campaign.contribute{value: GOAL}();

        uint256 expectedFee = (uint256(GOAL) * factory.feeBps()) / 10_000;
        uint256 expectedPayout = GOAL - expectedFee;

        uint256 beneficiaryBalanceBefore = beneficiary.balance;
        uint256 feeRecipientBalanceBefore = feeRecipient.balance;

        vm.prank(other);
        campaign.finalize();

        assertEq(uint8(campaign.status()), uint8(Campaign.Status.Successful));
        assertEq(beneficiary.balance - beneficiaryBalanceBefore, expectedPayout);
        assertEq(feeRecipient.balance - feeRecipientBalanceBefore, expectedFee);
        assertEq(address(campaign).balance, 0);
    }

    function testFinalizeRevertsIfGoalNotMet() public {
        vm.deal(contributor, GOAL - 1 ether);

        vm.prank(contributor);
        campaign.contribute{value: GOAL - 1 ether}();

        vm.expectRevert(GoalNotReached.selector);
        campaign.finalize();
    }

    function testRefundFlow() public {
        vm.deal(contributor, GOAL - 1 ether);

        vm.prank(contributor);
        campaign.contribute{value: GOAL - 1 ether}();

        vm.warp(block.timestamp + 8 days);

        uint256 contributorBalanceBefore = contributor.balance;
        uint256 expectedRefund = GOAL - 1 ether;

        vm.prank(contributor);
        campaign.refund();

        assertEq(uint8(campaign.status()), uint8(Campaign.Status.Failed));
        assertEq(contributor.balance, contributorBalanceBefore + expectedRefund);
        assertEq(campaign.contributionOf(contributor), 0);
        assertEq(campaign.raised(), 0);
        assertEq(campaign.feeAccrued(), 0);
    }

    function testRefundWithoutContributionReverts() public {
        vm.warp(block.timestamp + 8 days);

        vm.prank(other);
        vm.expectRevert(NothingToRefund.selector);
        campaign.refund();
    }

    function testRefundBeforeDeadlineReverts() public {
        vm.deal(contributor, GOAL - 1 ether);

        vm.prank(contributor);
        campaign.contribute{value: GOAL - 1 ether}();

        vm.expectRevert(RefundUnavailable.selector);
        campaign.refund();
    }

    function testMetadataUpdateOnlyCreator() public {
        vm.prank(creator);
        campaign.updateMetadata("ipfs://new");
        assertEq(campaign.metadataUri(), "ipfs://new");

        vm.prank(other);
        vm.expectRevert(Unauthorized.selector);
        campaign.updateMetadata("ipfs://bad");
    }

    function testFeeRecipientTwoStepUpdate() public {
        address newRecipient = address(0x1234);

        factory.proposeFeeRecipient(newRecipient);
        assertEq(factory.pendingFeeRecipient(), newRecipient);

        vm.prank(newRecipient);
        factory.acceptFeeRecipient();

        assertEq(factory.feeRecipient(), newRecipient);
        assertEq(factory.pendingFeeRecipient(), address(0));
    }
}
