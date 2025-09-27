// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {CampaignFactory} from "../src/CampaignFactory.sol";

contract Deploy is Script {
    function run() external returns (CampaignFactory factory) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT");

        vm.startBroadcast(deployerPrivateKey);
        factory = new CampaignFactory(feeRecipient);
        vm.stopBroadcast();

        console2.log("Factory", address(factory));
        console2.log("Implementation", factory.campaignImplementation());
    }
}
