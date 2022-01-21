// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;
pragma abicoder v2;

import "@rarible/lib-asset/contracts/LibAsset.sol";
import "@rarible/libraries/contracts/LibDeal.sol";
import "@rarible/libraries/contracts/LibFee.sol";
import "./IExternalTransferExecutor.sol";

interface ITransferManager is IExternalTransferExecutor {
    function calculateTotalAmount(
        uint amount,
        uint feeOnTopBp,
        LibPart.Part[] memory orderOriginFees
    ) external pure returns (uint total);

    function doTransfers(
        LibDeal.DealSide memory left,
        LibDeal.DealSide memory  right,
        LibFeeSide.FeeSide feeSide,
        address initialSender
    ) payable external returns (uint totalMakeValue, uint totalTakeValue);
}