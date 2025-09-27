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
    Unauthorized,
    DirectDepositDisabled,
    CampaignNotActive,
    ZeroAddress
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
    address internal secondContributor = address(0xF00D);

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
        vm.label(secondContributor, "SecondContributor");

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

    function testFuzzContributionFeeAccuracy(uint128 amount) public {
        vm.assume(amount > 0);
        vm.assume(amount < type(uint128).max / 2);

        vm.deal(contributor, amount);

        vm.prank(contributor);
        campaign.contribute{value: amount}();

        uint256 expectedFee = (uint256(amount) * factory.feeBps()) / 10_000;
        assertEq(campaign.feeAccrued(), expectedFee);
        assertEq(campaign.raised(), amount);
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

    function testReceiveReverts() public {
        vm.deal(contributor, 1 ether);

        vm.prank(contributor);
        vm.expectRevert(DirectDepositDisabled.selector);
        (bool ok,) = address(campaign).call{value: 1 ether}("");
        ok;
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

    function testFinalizeClearsProtocolFee() public {
        vm.deal(contributor, GOAL);

        vm.prank(contributor);
        campaign.contribute{value: GOAL}();

        vm.prank(other);
        campaign.finalize();

        assertEq(campaign.feeAccrued(), 0);
    }

    function testFinalizeRevertsIfGoalNotMet() public {
        vm.deal(contributor, GOAL - 1 ether);

        vm.prank(contributor);
        campaign.contribute{value: GOAL - 1 ether}();

        vm.expectRevert(GoalNotReached.selector);
        campaign.finalize();
    }

    function testFactoryRejectsZeroBeneficiary() public {
        uint64 deadline = uint64(block.timestamp + 3 days);
        vm.expectRevert(ZeroAddress.selector);
        factory.createCampaign(address(0), GOAL, deadline, URI);
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

    function testRefundAfterFinalizeReverts() public {
        vm.deal(contributor, GOAL);

        vm.prank(contributor);
        campaign.contribute{value: GOAL}();

        vm.prank(other);
        campaign.finalize();

        vm.prank(contributor);
        vm.expectRevert(RefundUnavailable.selector);
        campaign.refund();
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

    function testMultipleRefundsMaintainBalances() public {
        vm.deal(contributor, 6 ether);
        vm.deal(secondContributor, 4 ether);

        vm.prank(contributor);
        campaign.contribute{value: 6 ether}();
        vm.prank(secondContributor);
        campaign.contribute{value: 4 ether}();

        vm.warp(block.timestamp + 8 days);

        vm.prank(contributor);
        campaign.refund();

        assertEq(campaign.contributionOf(contributor), 0);
        assertEq(campaign.contributionOf(secondContributor), 4 ether);
        assertEq(campaign.raised(), 4 ether);

        vm.prank(secondContributor);
        campaign.refund();

        assertEq(campaign.raised(), 0);
        assertEq(campaign.feeAccrued(), 0);
    }

    function testMetadataUpdateOnlyCreator() public {
        vm.prank(creator);
        campaign.updateMetadata("ipfs://new");
        assertEq(campaign.metadataUri(), "ipfs://new");

        vm.prank(other);
        vm.expectRevert(Unauthorized.selector);
        campaign.updateMetadata("ipfs://bad");
    }

    function testRefundReentrancyGuard() public {
        ReentrancyRefundAttacker attacker = new ReentrancyRefundAttacker(campaign);

        vm.deal(address(attacker), 2 ether);
        vm.prank(address(attacker));
        attacker.contribute{value: 2 ether}();

        vm.warp(block.timestamp + 8 days);

        vm.prank(address(attacker));
        attacker.triggerRefund();

        assertEq(campaign.contributionOf(address(attacker)), 0);
        assertEq(campaign.raised(), 0);
        assertEq(address(attacker).balance, 2 ether);
    }

    function testUpdateMetadataAfterFinalizationFails() public {
        vm.deal(contributor, GOAL);
        vm.prank(contributor);
        campaign.contribute{value: GOAL}();

        vm.prank(other);
        campaign.finalize();

        vm.expectRevert(CampaignNotActive.selector);
        campaign.updateMetadata("ipfs://inactive");
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

contract ReentrancyRefundAttacker {
    Campaign internal immutable campaign;
    bool internal entered;

    constructor(Campaign campaign_) {
        campaign = campaign_;
    }

    function contribute() external payable {
        campaign.contribute{value: msg.value}();
    }

    function triggerRefund() external {
        campaign.refund();
    }

    receive() external payable {
        if (entered) {
            return;
        }
        entered = true;
        try campaign.refund() {} catch {}
        entered = false;
    }
}
