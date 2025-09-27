// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// Custom errors shared by the KASFundME campaign system.
error CampaignAlreadyInitialized();
error ZeroAddress();
error InvalidGoal();
error InvalidDeadline();
error ZeroContribution();
error CampaignNotActive();
error DeadlineReached();
error GoalNotReached();
error RefundUnavailable();
error NothingToRefund();
error Unauthorized();
error ContributionLimitExceeded();
error TransferFailed();
error DirectDepositDisabled();
