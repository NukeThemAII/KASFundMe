// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {
    CampaignAlreadyInitialized,
    ZeroAddress,
    InvalidGoal,
    InvalidDeadline,
    ZeroContribution,
    CampaignNotActive,
    DeadlineReached,
    GoalNotReached,
    RefundUnavailable,
    NothingToRefund,
    Unauthorized,
    ContributionLimitExceeded,
    TransferFailed,
    DirectDepositDisabled
} from "./CampaignErrors.sol";

interface ICampaignFactory {
    function feeBps() external view returns (uint96);
    function feeRecipient() external view returns (address);
}

/// @title Campaign
/// @notice Minimal-proxy campaign implementation for KASFundME.
contract Campaign is ReentrancyGuard {
    /// @notice Funding status values for a campaign lifecycle.
    enum Status {
        Active,
        Successful,
        Failed
    }

    uint128 public goal; // total goal in wei
    uint128 public raised; // gross contributions (before fees)
    uint128 public feeAccrued; // total protocol fee accumulated

    uint64 private _deadline;
    Status private _status;

    uint96 private _feeBps;

    address public factory;
    address public creator;
    address public beneficiary;

    string private _metadataUri;

    bool private _initialized;

    mapping(address => uint128) private _contributions;
    mapping(address => uint128) private _feeLedger;

    uint96 internal constant FEE_DENOMINATOR = 10_000;

    /// @notice Emitted on each successful contribution.
    event Contributed(
        address indexed contributor, uint128 amount, uint128 fee, uint128 totalRaised
    );

    /// @notice Emitted when the campaign finalizes successfully.
    event Finalized(
        address indexed caller, address indexed beneficiary, uint128 payout, uint128 feeTotal
    );

    /// @notice Emitted when a contributor redeems their refund.
    event Refunded(address indexed contributor, uint128 amount);

    /// @notice Emitted when the metadata URI is updated.
    event MetadataUpdated(string newUri);

    /// @dev Prevent receiving funds outside the contribute flow.
    receive() external payable {
        revert DirectDepositDisabled();
    }

    /// @dev Prevent accidental calls.
    fallback() external payable {
        revert DirectDepositDisabled();
    }

    /// @notice Initializes storage for an EIP-1167 proxy instance.
    /// @dev Must be called exactly once by the factory immediately after cloning.
    function initialize(
        address factory_,
        address creator_,
        address beneficiary_,
        uint128 goal_,
        uint64 deadline_,
        string calldata initialMetadataUri
    ) external {
        if (_initialized) revert CampaignAlreadyInitialized();
        if (factory_ == address(0) || creator_ == address(0) || beneficiary_ == address(0)) {
            revert ZeroAddress();
        }
        if (msg.sender != factory_) revert Unauthorized();
        if (goal_ == 0) revert InvalidGoal();
        if (deadline_ <= block.timestamp) revert InvalidDeadline();

        factory = factory_;
        creator = creator_;
        beneficiary = beneficiary_;
        goal = goal_;
        _deadline = deadline_;
        _status = Status.Active;
        _metadataUri = initialMetadataUri;
        _feeBps = ICampaignFactory(factory_).feeBps();

        _initialized = true;
    }

    /// @notice Returns the current deadline timestamp.
    function deadline() external view returns (uint64) {
        return _deadline;
    }

    /// @notice Returns the current campaign status.
    function status() external view returns (Status) {
        return _status;
    }

    /// @notice Returns the protocol fee basis points configured at initialization.
    function feeBps() external view returns (uint96) {
        return _feeBps;
    }

    /// @notice Returns the stored metadata URI.
    function metadataUri() external view returns (string memory) {
        return _metadataUri;
    }

    /// @notice Returns the gross contribution recorded for an address.
    function contributionOf(address account) external view returns (uint128) {
        return _contributions[account];
    }

    /// @notice Contribute KAS to the campaign while it is active.
    function contribute() external payable nonReentrant {
        if (_status != Status.Active) revert CampaignNotActive();
        if (block.timestamp >= _deadline) revert DeadlineReached();
        if (msg.value == 0) revert ZeroContribution();

        uint256 amount = msg.value;
        if (amount > type(uint128).max) revert ContributionLimitExceeded();

        uint256 accumulatedRaised = uint256(raised) + amount;
        if (accumulatedRaised > type(uint128).max) revert ContributionLimitExceeded();

        uint256 fee = _calculateFee(amount);
        uint256 accumulatedFee = uint256(feeAccrued) + fee;
        if (accumulatedFee > type(uint128).max) revert ContributionLimitExceeded();

        uint256 contributorTotal = uint256(_contributions[msg.sender]) + amount;
        if (contributorTotal > type(uint128).max) revert ContributionLimitExceeded();

        uint256 contributorFeeTotal = uint256(_feeLedger[msg.sender]) + fee;
        if (contributorFeeTotal > type(uint128).max) revert ContributionLimitExceeded();

        raised = uint128(accumulatedRaised);
        feeAccrued = uint128(accumulatedFee);
        _contributions[msg.sender] = uint128(contributorTotal);
        _feeLedger[msg.sender] = uint128(contributorFeeTotal);

        emit Contributed(msg.sender, uint128(amount), uint128(fee), raised);
    }

    /// @notice Finalize the campaign and distribute funds once the goal is met.
    function finalize() external nonReentrant {
        if (_status != Status.Active) revert CampaignNotActive();
        if (raised < goal) revert GoalNotReached();

        _status = Status.Successful;

        uint256 feeTotal = feeAccrued;
        uint256 payout = address(this).balance - feeTotal;
        feeAccrued = 0;

        _payout(beneficiary, payout);

        address feeRecipient = ICampaignFactory(factory).feeRecipient();
        if (feeRecipient == address(0)) revert ZeroAddress();
        if (feeTotal > 0) {
            _payout(feeRecipient, feeTotal);
        }

        emit Finalized(msg.sender, beneficiary, uint128(payout), uint128(feeTotal));
    }

    /// @notice Refund the caller if the campaign failed to reach its goal.
    function refund() external nonReentrant {
        if (_status == Status.Successful) revert RefundUnavailable();

        if (_status == Status.Active) {
            if (block.timestamp < _deadline || raised >= goal) revert RefundUnavailable();
            _status = Status.Failed;
        }

        uint128 balance = _contributions[msg.sender];
        if (balance == 0) revert NothingToRefund();

        uint128 feeShare = _feeLedger[msg.sender];

        _contributions[msg.sender] = 0;
        _feeLedger[msg.sender] = 0;

        raised = uint128(uint256(raised) - balance);
        feeAccrued = uint128(uint256(feeAccrued) - feeShare);

        _payout(msg.sender, balance);

        emit Refunded(msg.sender, balance);
    }

    /// @notice Update the metadata URI while the campaign is active.
    function updateMetadata(string calldata newUri) external {
        if (_status != Status.Active) revert CampaignNotActive();
        if (msg.sender != creator) revert Unauthorized();

        _metadataUri = newUri;
        emit MetadataUpdated(newUri);
    }

    function _calculateFee(uint256 amount) private view returns (uint256) {
        return (amount * _feeBps) / FEE_DENOMINATOR;
    }

    function _payout(address recipient, uint256 amount) private {
        if (amount == 0) return;

        (bool ok,) = recipient.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
