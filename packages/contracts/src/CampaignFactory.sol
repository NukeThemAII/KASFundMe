// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "lib/openzeppelin-contracts/contracts/proxy/Clones.sol";
import {Ownable2Step} from "lib/openzeppelin-contracts/contracts/access/Ownable2Step.sol";
import {Ownable} from "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

import {Campaign} from "./Campaign.sol";
import {ZeroAddress, Unauthorized} from "./CampaignErrors.sol";

/// @title CampaignFactory
/// @notice Deploys EIP-1167 campaign clones for the KASFundME protocol.
contract CampaignFactory is Ownable2Step {
    using Clones for address;

    uint96 public constant FEE_BPS = 100; // 1%
    address public immutable CAMPAIGN_IMPLEMENTATION;

    address public feeRecipient;
    address public pendingFeeRecipient;

    mapping(address => bool) public isCampaign;

    event CampaignCreated(
        address indexed campaign,
        address indexed creator,
        address indexed beneficiary,
        uint128 goal,
        uint64 deadline,
        string metadataUri
    );

    event FeeRecipientUpdateRequested(address indexed newRecipient);
    event FeeRecipientUpdated(address indexed newRecipient);

    constructor(address initialFeeRecipient) Ownable(msg.sender) {
        if (initialFeeRecipient == address(0)) revert ZeroAddress();

        CAMPAIGN_IMPLEMENTATION = address(new Campaign());
        feeRecipient = initialFeeRecipient;
    }

    /// @notice Deploy a new campaign clone.
    function createCampaign(
        address beneficiary,
        uint128 goal,
        uint64 deadline,
        string calldata metadataUri
    ) external returns (address campaign) {
        campaign = CAMPAIGN_IMPLEMENTATION.clone();
        Campaign(payable(campaign)).initialize(
            address(this), msg.sender, beneficiary, goal, deadline, metadataUri
        );
        isCampaign[campaign] = true;

        emit CampaignCreated(campaign, msg.sender, beneficiary, goal, deadline, metadataUri);
    }

    /// @notice Current campaign implementation address.
    function campaignImplementation() external view returns (address) {
        return CAMPAIGN_IMPLEMENTATION;
    }

    /// @notice Immutable protocol fee basis points.
    function feeBps() external pure returns (uint96) {
        return FEE_BPS;
    }

    /// @notice Initiate a fee recipient change. Requires the pending address to accept.
    function proposeFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();

        pendingFeeRecipient = newRecipient;
        emit FeeRecipientUpdateRequested(newRecipient);
    }

    /// @notice Accept a pending fee recipient role.
    function acceptFeeRecipient() external {
        if (msg.sender != pendingFeeRecipient) revert Unauthorized();

        feeRecipient = msg.sender;
        pendingFeeRecipient = address(0);

        emit FeeRecipientUpdated(msg.sender);
    }
}
