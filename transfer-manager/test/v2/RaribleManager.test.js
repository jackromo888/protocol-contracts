const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const RaribleTransferManagerTest = artifacts.require("RaribleTransferManagerTest.sol");
const TestERC20 = artifacts.require("TestERC20.sol");
const TestERC721 = artifacts.require("TestERC721.sol");
const TestERC1155 = artifacts.require("TestERC1155.sol");
const TransferProxyTest = artifacts.require("TransferProxyTest.sol");
const ERC20TransferProxyTest = artifacts.require("ERC20TransferProxyTest.sol");
const ERC721_V1 = artifacts.require("TestERC721WithRoyaltiesV1.sol");
const ERC721_V2 = artifacts.require("TestERC721WithRoyaltiesV2.sol");
const ERC1155_V1 = artifacts.require("TestERC1155WithRoyaltiesV1.sol");
const ERC1155_V2 = artifacts.require("TestERC1155WithRoyaltiesV2.sol");
const ERC721_V1_Error = artifacts.require("TestERC721WithRoyaltiesV1_InterfaceError.sol");
const ERC1155_V2_Error = artifacts.require("TestERC1155WithRoyaltiesV2_InterfaceError.sol");
const TestRoyaltiesRegistry = artifacts.require("TestRoyaltiesRegistry.sol");
const ERC721LazyMintTest = artifacts.require("ERC721LazyMintTest.sol");
const ERC1155LazyMintTest = artifacts.require("ERC1155LazyMintTest.sol");
const ERC721LazyMintTransferProxy = artifacts.require("ERC721LazyMintTransferProxyTest.sol")
const ERC1155LazyMintTransferProxy = artifacts.require("ERC1155LazyMintTransferProxyTest.sol")
const CryptoPunksMarket = artifacts.require("CryptoPunksMarket.sol");
const PunkTransferProxy = artifacts.require("PunkTransferProxyTest.sol")

const { Order, Asset, sign } = require("@rarible/exchange-v2/test/order.js");
const EIP712 = require("@rarible/exchange-v2/test/EIP712");
const ZERO = "0x0000000000000000000000000000000000000000";
const ADDR1 = "0x0000000000000000000000000000000000000001";
const ADDR2 = "0x0000000000000000000000000000000000000002";
const ADDR3 = "0x0000000000000000000000000000000000000003";
const ADDR4 = "0x0000000000000000000000000000000000000004";
const ADDR5 = "0x0000000000000000000000000000000000000005";
const ADDR6 = "0x0000000000000000000000000000000000000006";
const ADDR7 = "0x0000000000000000000000000000000000000007";
const ADDR8 = "0x0000000000000000000000000000000000000008";
const ADDR9 = "0x0000000000000000000000000000000000000009";
const ADDR10 = "0x0000000000000000000000000000000000000010";
const ADDR11 = "0x0000000000000000000000000000000000000011";
const ADDR12 = "0x0000000000000000000000000000000000000012";
const ADDR13 = "0x0000000000000000000000000000000000000013";
const ADDR14 = "0x0000000000000000000000000000000000000014";
const ADDR15 = "0x0000000000000000000000000000000000000015";
const ADDR16 = "0x0000000000000000000000000000000000000016";
const ADDR17 = "0x0000000000000000000000000000000000000017";
const ADDR18 = "0x0000000000000000000000000000000000000018";
const ADDR19 = "0x0000000000000000000000000000000000000019";
const ADDR20 = "0x0000000000000000000000000000000000000020";
const ADDR21 = "0x0000000000000000000000000000000000000021";
const eth = "0x0000000000000000000000000000000000000000";
const { expectThrow, verifyBalanceChange } = require("@daonomic/tests-common");
const { ETH, ERC20, ERC721, ERC1155, ORDER_DATA_V1, ORDER_DATA_V2, TO_MAKER, TO_TAKER, PROTOCOL, ROYALTY, ORIGIN, PAYOUT, CRYPTO_PUNK, COLLECTION, enc, encDataV2, id } = require("@rarible/exchange-v2/test/assets");
const truffleAssert = require('truffle-assertions');

contract("RaribleTransferManagerTest:doTransferTest()", accounts => {
	let testing;
	let transferProxy;
	let erc20TransferProxy;
	let t1;
	let t2;
	let protocol = accounts[9];
	let community = accounts[8];
	let erc721;
	let erc1155;
	let erc721V1;
	let erc721V2;
	let erc1155V1;
	let erc1155V2;
	let erc721V1_Error;
	let erc1155V2_Error;
	let erc721TokenId0 = 52;
	let erc721TokenId1 = 53;
	let erc1155TokenId1 = 54;
	let erc1155TokenId2 = 55;
	let royaltiesRegistry;
	const operator1 = accounts[1];
	const operator = accounts[0];
  const protocolCommission = 300;

	function encDataV1(tuple) {
		return testing.encode(tuple)
	}

	beforeEach(async () => {
		transferProxy = await TransferProxyTest.new();
		erc20TransferProxy = await ERC20TransferProxyTest.new();
		testing = await RaribleTransferManagerTest.new();
		royaltiesRegistry = await TestRoyaltiesRegistry.new();

		await testing.__TransferManager_init(transferProxy.address, erc20TransferProxy.address, community, royaltiesRegistry.address);
    await testing.addOperator(operator1);
    await testing.addOperator(operator);

		t1 = await TestERC20.new();
		t2 = await TestERC20.new();
		/*ERC721 */
		erc721 = await TestERC721.new("Rarible", "RARI", "https://ipfs.rarible.com");
		/*ERC1155*/
		erc1155 = await TestERC1155.new("https://ipfs.rarible.com");
		await testing.setFeeReceiver(t1.address, protocol);//
    /*ETH*/
    await testing.setFeeReceiver(eth, protocol);//
    /*NFT 721 RoyalitiesV1*/
    erc721V1 = await ERC721_V1.new("Rarible", "RARI", "https://ipfs.rarible.com");
    await erc721V1.initialize();
    /*NFT 721 RoyalitiesV2*/
    erc721V2 = await ERC721_V2.new("Rarible", "RARI", "https://ipfs.rarible.com");
    await erc721V2.initialize();
    /*1155 RoyalitiesV1*/
    erc1155V1 = await ERC1155_V1.new("https://ipfs.rarible.com");
    await erc1155V1.initialize();
    /*1155 RoyalitiesV2*/
    erc1155V2 = await ERC1155_V2.new("https://ipfs.rarible.com");
    await erc1155V2.initialize();
		/*NFT 721 RoyalitiesV1 with interface error*/
		erc721V1_Error = await ERC721_V1_Error.new("Rarible", "RARI", "https://ipfs.rarible.com");
		/*NFT 1155 RoyalitiesV2 with interface error*/
		erc1155V2_Error = await ERC1155_V2_Error.new("https://ipfs.rarible.com");
	});

  describe("Check doTransfers()", () => {
//    it("New 1 ", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare20_721OrdersFordoTransfersWithFees()
//      const ethSender = ZERO;
//      let txGas = await testing.doTransfersWithFees(leftSide, rightSide, ROYALTY);
//      console.log("New 1, estimate Gas: ", txGas.receipt.gasUsed);

//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[2]), 97);
//			assert.equal(await erc721.balanceOf(accounts[1]), 1);
//			assert.equal(await erc721.balanceOf(accounts[2]), 0);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})

//    it("Original 1 ", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare20_721OrdersFordoTransfersWithFees()
//      const ethSender = ZERO;
//      let txGas = await testing.doTransfersWithFees_orig(leftSide, rightSide, ROYALTY);
//      console.log("Original 1, estimate Gas: ", txGas.receipt.gasUsed);

//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[2]), 97);
//			assert.equal(await erc721.balanceOf(accounts[1]), 1);
//			assert.equal(await erc721.balanceOf(accounts[2]), 0);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})

		async function prepare20_721OrdersFordoTransfersNoFees(t1Amount = 105) {
			await t1.mint(accounts[1], t1Amount);
			await erc721.mint(accounts[2], erc721TokenId1);
			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
			await erc721.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});

			const left = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
			const right = Order(accounts[2], Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
      const leftSide = await testing.getDealSide.call(left);
      const rightSide = await testing.getDealSide.call(right);
      const matchFees = await testing.getFeeSide.call(left, right);
			return { left, right, leftSide, rightSide, matchFees };
		}

		async function prepare20_721OrdersFordoTransfersWithFees(t1Amount = 200) {
			await t1.mint(accounts[1], t1Amount);
			await erc721.mint(accounts[2], erc721TokenId1);
			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
			await erc721.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});
			let addrOriginLeft = [[accounts[3], 1000]];
			let addrOriginRight = [[accounts[3], 2000]];
			let encDataLeft = await encDataV1([ [[accounts[1], 10000]], addrOriginLeft]);
			let encDataRight = await encDataV1([ [[accounts[2], 10000]], addrOriginRight]);
//			const left = Order(accounts[1], Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), ZERO, Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 100), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
//			const right = Order(accounts[2], Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 100), ZERO, Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, encDataRight);

			const left = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
			const right = Order(accounts[2], Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, ORDER_DATA_V1, encDataRight);
      const leftSide = await testing.getDealSide.call(left);
      const rightSide = await testing.getDealSide.call(right);
      const matchFees = await testing.getFeeSide.call(left, right);
			return { left, right, leftSide, rightSide, matchFees };
		}
  })

	describe("Check doTransfers()", () => {

		it("Transfer from ETH to ERC1155, with Origins", async () => {
			const { left, right, leftSide, rightSide, matchFees } = await prepareETH_1155OrdersOrig(10);
      const ethSender = accounts[0];
      let txGas = await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender, {value: 300, from: ethSender, gasPrice: 0});
      console.log("New  doTransfers 1, estimate Gas: ", txGas.receipt.gasUsed);
//      await verifyBalanceChange(accounts[0], 113, () => //103
//      	verifyBalanceChange(accounts[2], -77, () =>//
//      	  verifyBalanceChange(accounts[3], -30, () =>
//        	  verifyBalanceChange(protocol, -6, () =>
//              testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender,
//          	    {value: 300, from: ethSender, gasPrice: 0}
//          	  )
//          	)
//          )
//        )
//      );
			assert.equal(await erc1155.balanceOf(accounts[0], erc1155TokenId1), 7);
			assert.equal(await erc1155.balanceOf(accounts[2], erc1155TokenId1), 3);
		})

		async function prepareETH_1155OrdersOrig(t2Amount = 10) {
			await erc1155.mint(accounts[2], erc1155TokenId1, t2Amount);
			await erc1155.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});
			let addrOriginLeft = [[accounts[3], 1000]];
			let addrOriginRight = [[accounts[3], 2000]]; //[[accounts[3], 2000]];
			let encDataLeft = await encDataV1([ [[accounts[0], 10000]], addrOriginLeft]);
			let encDataRight = await encDataV1([ [[accounts[2], 10000]], addrOriginRight]);
			const left = Order(accounts[0], Asset(ETH, "0x", 100), ZERO, Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 7), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
			const right = Order(accounts[2], Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 7), ZERO, Asset(ETH, "0x", 100), 1, 0, 0, ORDER_DATA_V1, encDataRight);
      const leftSide = await testing.getDealSide.call(left);
      const rightSide = await testing.getDealSide.call(right);
      const matchFees = await testing.getFeeSide.call(left, right);
			return { left, right, leftSide, rightSide, matchFees };
		}

		it("Transfer from ETH to ERC1155, with Origins", async () => {
			const { left, right, leftSide, rightSide, matchFees } = await prepareETH_1155OrdersRoy(10);
      const ethSender = accounts[0];
      let txGas = await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender, {value: 300, from: ethSender, gasPrice: 0});
      console.log("New  doTransfers 1, estimate Gas: ", txGas.receipt.gasUsed);
//      await verifyBalanceChange(accounts[0], 113, () => //103
//      	verifyBalanceChange(accounts[2], -77, () =>//
//      	  verifyBalanceChange(accounts[3], -30, () =>
//        	  verifyBalanceChange(protocol, -6, () =>
//              testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender,
//          	    {value: 300, from: ethSender, gasPrice: 0}
//          	  )
//          	)
//          )
//        )
//      );
			assert.equal(await erc1155.balanceOf(accounts[0], erc1155TokenId1), 7);
			assert.equal(await erc1155.balanceOf(accounts[2], erc1155TokenId1), 3);
		})

		async function prepareETH_1155OrdersRoy(t2Amount = 10) {
			await erc1155.mint(accounts[2], erc1155TokenId1, t2Amount);
			await erc1155.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});
			let addrOriginLeft = [[accounts[3], 1000]];
			let addrOriginRight = [[accounts[3], 2000]]; //[[accounts[3], 2000]];
			let encDataLeft = await encDataV1([ [[accounts[0], 10000]], addrOriginLeft]);
			let encDataRight = await encDataV1([ [[accounts[2], 10000]], addrOriginRight]);
			await royaltiesRegistry.setRoyaltiesByToken(erc1155.address, [[accounts[2], 1000]]); //set royalties by token
			const left = Order(accounts[0], Asset(ETH, "0x", 100), ZERO, Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 7), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
			const right = Order(accounts[2], Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 7), ZERO, Asset(ETH, "0x", 100), 1, 0, 0, ORDER_DATA_V1, encDataRight);
      const leftSide = await testing.getDealSide.call(left);
      const rightSide = await testing.getDealSide.call(right);
      const matchFees = await testing.getFeeSide.call(left, right);
			return { left, right, leftSide, rightSide, matchFees };
		}

//    it("Transfer from ERC721 to ERC721", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare721_721Orders()
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//			assert.equal(await erc721.ownerOf(erc721TokenId1), accounts[2]);
//			assert.equal(await erc721.ownerOf(erc721TokenId0), accounts[1]);
//		})
//
//		async function prepare721_721Orders() {
//			await erc721.mint(accounts[1], erc721TokenId1);
//			await erc721.mint(accounts[2], erc721TokenId0);
//			await erc721.setApprovalForAll(transferProxy.address, true, {from: accounts[1]});
//			await erc721.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});
//			let data = await encDataV1([ [], []]);
//			const left = Order(accounts[1], Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), ZERO, Asset(ERC721, enc(erc721.address, erc721TokenId0), 1), 1, 0, 0, ORDER_DATA_V1, data);
//			const right = Order(accounts[2], Asset(ERC721, enc(erc721.address, erc721TokenId0), 1), ZERO, Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, data);
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees };
//
//		}
//
//    it("Transfer from ERC721 to ERC1155, (buyerFee3%, sallerFee3% = 6%) of ERC1155 transfer to community, orders dataType == V1", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare721_1155Orders(110)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await erc721.balanceOf(accounts[1]), 0);
//			assert.equal(await erc721.balanceOf(accounts[2]), 1);
//			assert.equal(await erc1155.balanceOf(accounts[1], erc1155TokenId1), 93);
//			assert.equal(await erc1155.balanceOf(accounts[2], erc1155TokenId1), 1);
//			assert.equal(await erc1155.balanceOf(community, erc1155TokenId1), 6);
//		})
//
//		async function prepare721_1155Orders(t2Amount = 105) {
//			await erc721.mint(accounts[1], erc721TokenId1);
//			await erc1155.mint(accounts[2], erc1155TokenId1, t2Amount);
//			await erc721.setApprovalForAll(transferProxy.address, true, {from: accounts[1]});
//			await erc1155.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});
//			/*in this: accounts[3] - address originLeftOrder, 100 - originLeftOrderFee(bp%)*/
//			let addrOriginLeft = [[accounts[3], 100], [accounts[5], 300]];
//			let addrOriginRight = [[accounts[4], 200], [accounts[6], 400]];
//			let encDataLeft = await encDataV1([ [[accounts[1], 10000]], addrOriginLeft]);
//			let encDataRight = await encDataV1([ [[accounts[2], 10000]], addrOriginRight]);
//			const left = Order(accounts[1], Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), ZERO, Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 100), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
//			const right = Order(accounts[2], Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 100), ZERO, Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, encDataRight);
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees };
//		}
//
//		it("Transfer from ERC1155 to ERC1155: 2 to 10, 50% 50% for payouts", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare1155_1155Orders(2, 10);
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await erc1155.balanceOf(accounts[1], erc1155TokenId1), 98);
//			assert.equal(await erc1155.balanceOf(accounts[2], erc1155TokenId1), 0);
//			assert.equal(await erc1155.balanceOf(accounts[1], erc1155TokenId2), 0);
//			assert.equal(await erc1155.balanceOf(accounts[2], erc1155TokenId2), 90);
//
//			assert.equal(await erc1155.balanceOf(accounts[3], erc1155TokenId2), 5);
//			assert.equal(await erc1155.balanceOf(accounts[5], erc1155TokenId2), 5);
//			assert.equal(await erc1155.balanceOf(accounts[4], erc1155TokenId1), 1);
//			assert.equal(await erc1155.balanceOf(accounts[6], erc1155TokenId1), 1);
//		});
//
//		async function prepare1155_1155Orders(t1Amount, t2Amount) {
//			await erc1155.mint(accounts[1], erc1155TokenId1, 100);
//			await erc1155.mint(accounts[2], erc1155TokenId2, 100);
//			await erc1155.setApprovalForAll(transferProxy.address, true, {from: accounts[1]});
//			await erc1155.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});
//			let encDataLeft = await encDataV1([ [[accounts[3], 5000], [accounts[5], 5000]], []]);
//			let encDataRight = await encDataV1([ [[accounts[4], 5000], [accounts[6], 5000]], []]);
//			const left = Order(accounts[1], Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), t1Amount), ZERO, Asset(ERC1155, enc(erc1155.address, erc1155TokenId2), t2Amount), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
//			const right = Order(accounts[2], Asset(ERC1155, enc(erc1155.address, erc1155TokenId2), t2Amount), ZERO, Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), t1Amount), 1, 0, 0, ORDER_DATA_V1, encDataRight);
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees };
//		}
//
//		it("rounding error Transfer from ERC1155 to ERC1155: 1 to 5, 50% 50% for payouts", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare1155_1155Orders(1, 5);
//      const ethSender = ZERO;
////      left.makeAsset.value = 1;
////      left.takeAsset.value = 5;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await erc1155.balanceOf(accounts[1], erc1155TokenId1), 99);
//			assert.equal(await erc1155.balanceOf(accounts[2], erc1155TokenId1), 0);
//			assert.equal(await erc1155.balanceOf(accounts[1], erc1155TokenId2), 0);
//			assert.equal(await erc1155.balanceOf(accounts[2], erc1155TokenId2), 95);
//
//			assert.equal(await erc1155.balanceOf(accounts[3], erc1155TokenId2), 2);
//			assert.equal(await erc1155.balanceOf(accounts[5], erc1155TokenId2), 3);
//			assert.equal(await erc1155.balanceOf(accounts[4], erc1155TokenId1), 0);
//			assert.equal(await erc1155.balanceOf(accounts[6], erc1155TokenId1), 1);
//			assert.equal(await erc1155.balanceOf(community, erc1155TokenId1), 0);
//		});
//
//    it("Transfer from ERC1155 to ERC721, (buyerFee3%, sallerFee3% = 6%) of ERC1155 protocol (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare1155O_721rders(105)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await erc721.balanceOf(accounts[2]), 0);
//			assert.equal(await erc721.balanceOf(accounts[1]), 1);
//			assert.equal(await erc1155.balanceOf(accounts[2], erc1155TokenId1), 97);
//			assert.equal(await erc1155.balanceOf(accounts[1], erc1155TokenId1), 2);
//			assert.equal(await erc1155.balanceOf(protocol, erc1155TokenId1), 6);
//		})
//
//		async function prepare1155O_721rders(t2Amount = 105) {
//			await erc1155.mint(accounts[1], erc1155TokenId1, t2Amount);
//			await erc721.mint(accounts[2], erc721TokenId1);
//			await erc1155.setApprovalForAll(transferProxy.address, true, {from: accounts[1]});
//			await erc721.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});
//			await testing.setFeeReceiver(erc1155.address, protocol);
//			const left = Order(accounts[1], Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 100), ZERO, Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
//			const right =Order(accounts[2], Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), ZERO, Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees };
//		}
//
//    it("Transfer from ERC20 to ERC1155, protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare20_1155Orders(105, 10)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[2]), 97);
//			assert.equal(await erc1155.balanceOf(accounts[1], erc1155TokenId1), 7);
//			assert.equal(await erc1155.balanceOf(accounts[2], erc1155TokenId1), 3);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		async function prepare20_1155Orders(t1Amount = 105, t2Amount = 10) {
//			await t1.mint(accounts[1], t1Amount);
//			await erc1155.mint(accounts[2], erc1155TokenId1, t2Amount);
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
//			await erc1155.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});
//
//			const left = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 7), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[2], Asset(ERC1155, enc(erc1155.address, erc1155TokenId1), 7), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees };
//		}
//
//		it("Transfer from ERC1155 to ERC20, protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare1155_20Orders(10, 105)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[3]), 97);
//			assert.equal(await t1.balanceOf(accounts[4]), 2);
//			assert.equal(await erc1155.balanceOf(accounts[3], erc1155TokenId2), 3);
//			assert.equal(await erc1155.balanceOf(accounts[4], erc1155TokenId2), 7);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		async function prepare1155_20Orders(t1Amount = 10, t2Amount = 105) {
//			await erc1155.mint(accounts[3], erc1155TokenId2, t1Amount);
//			await t1.mint(accounts[4], t2Amount);
//			await erc1155.setApprovalForAll(transferProxy.address, true, {from: accounts[3]});
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[4] });
//
//			const left = Order(accounts[3], Asset(ERC1155, enc(erc1155.address, erc1155TokenId2), 7), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[4], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC1155, enc(erc1155.address, erc1155TokenId2), 7), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees };
//		}
//
//		it("Transfer from ERC20 to ERC721, protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare20_721Orders()
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[2]), 97);
//			assert.equal(await erc721.balanceOf(accounts[1]), 1);
//			assert.equal(await erc721.balanceOf(accounts[2]), 0);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		async function prepare20_721Orders(t1Amount = 105) {
//			await t1.mint(accounts[1], t1Amount);
//			await erc721.mint(accounts[2], erc721TokenId1);
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
//			await erc721.setApprovalForAll(transferProxy.address, true, {from: accounts[2]});
//
//			const left = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[2], Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees };
//		}
//
//		it("Transfer from ERC721 to ERC20, protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare721_20Orders()
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 97);
//			assert.equal(await t1.balanceOf(accounts[2]), 2);
//			assert.equal(await erc721.balanceOf(accounts[1]), 0);
//			assert.equal(await erc721.balanceOf(accounts[2]), 1);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		async function prepare721_20Orders(t1Amount = 105) {
//			await erc721.mint(accounts[1], erc721TokenId1);
//			await t1.mint(accounts[2], t1Amount);
//			await erc721.setApprovalForAll(transferProxy.address, true, {from: accounts[1]});
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[2] });
//
//			const left = Order(accounts[1], Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[2], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC721, enc(erc721.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees };
//		}
//
//		it("Transfer from ERC20 to ERC20, protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare2Orders()
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[2]), 97);
//			assert.equal(await t2.balanceOf(accounts[1]), 200);
//			assert.equal(await t2.balanceOf(accounts[2]), 20);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//    async function prepare2Orders(t1Amount = 105, t2Amount = 220) {
//    	await t1.mint(accounts[1], t1Amount);
//      await t2.mint(accounts[2], t2Amount);
//      await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
//      await t2.approve(erc20TransferProxy.address, 10000000, { from: accounts[2] });
//
//      const left = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC20, enc(t2.address), 200), 1, 0, 0, "0xffffffff", "0x");
//      const right = Order(accounts[2], Asset(ERC20, enc(t2.address), 200), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees };
//    }
	})
//
//  describe("Check Crypto-punk transferring", () => {
//    it("Transfer Crypto-Punk to ERC20 ", async () => {
//      cryptoPunksMarket = await CryptoPunksMarket.new();
//      await cryptoPunksMarket.allInitialOwnersAssigned(); //allow test contract work with Punk CONTRACT_OWNER accounts[0]
//      let punkIndex = 256;
//      await cryptoPunksMarket.getPunk(punkIndex, { from: accounts[1] }); //accounts[1] - owner punk with punkIndex
//
//      const proxy = await PunkTransferProxy.new();
//      await proxy.__OperatorRole_init();
//      await proxy.addOperator(testing.address);
//      await cryptoPunksMarket.offerPunkForSaleToAddress(punkIndex, 0, proxy.address, { from: accounts[1] }); //accounts[1] - wants to sell punk with punkIndex, min price 0 wei
//
//      await testing.setTransferProxy(id("CRYPTO_PUNKS"), proxy.address)
//      const encodedMintData = await enc(cryptoPunksMarket.address, punkIndex);;
//      await t1.mint(accounts[2], 106);
//      await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[2] });
//
//      const left = Order(accounts[1], Asset(id("CRYPTO_PUNKS"), encodedMintData, 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//      const right = Order(accounts[2], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(id("CRYPTO_PUNKS"), encodedMintData, 1), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//
//      const ethSender = accounts[0];
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//      assert.equal(await t1.balanceOf(accounts[1]), 97); //get 97 because protocol down-fee
//      assert.equal(await t1.balanceOf(accounts[2]), 3);// accounts[1] pay 103 because protocol up-fee
//      assert.equal(await cryptoPunksMarket.balanceOf(accounts[1]), 0);//accounts[1] - not owner now
//      assert.equal(await cryptoPunksMarket.balanceOf(accounts[2]), 1);//punk owner - accounts[2]
//    })
//
//    it("Transfer from Crypto-punk to ETH, protocol fee 6% ", async () => {
//    	const { left, right, leftSide, rightSide, matchFees } = await prepareETH_PunkOrders()
//      const ethSender = accounts[0];
//      await verifyBalanceChange(accounts[0], 103, () =>
//      	verifyBalanceChange(accounts[2], -97, () =>
//        	verifyBalanceChange(protocol, -6, () =>
//        	  testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender,
//            	{value: 103, from: ethSender, gasPrice: 0}
//            )
//          )
//        )
//      );
//      assert.equal(await cryptoPunksMarket.balanceOf(accounts[2]), 0);//accounts[2] - not owner now
//      assert.equal(await cryptoPunksMarket.balanceOf(accounts[0]), 1);//punk owner - accounts[0]
//    })
//
//    async function prepareETH_PunkOrders() {
//      cryptoPunksMarket = await CryptoPunksMarket.new();
//      await cryptoPunksMarket.allInitialOwnersAssigned(); //allow test contract work with Punk CONTRACT_OWNER accounts[0]
//      let punkIndex = 256;
//      await cryptoPunksMarket.getPunk(punkIndex, { from: accounts[2] }); //accounts[2] - owner punk with punkIndex
//
//      const proxy = await PunkTransferProxy.new();
//      await proxy.__OperatorRole_init();
//      await proxy.addOperator(testing.address);
//      await cryptoPunksMarket.offerPunkForSaleToAddress(punkIndex, 0, proxy.address, { from: accounts[2] }); //accounts[1] - wants to sell punk with punkIndex, min price 0 wei
//
//      await testing.setTransferProxy(id("CRYPTO_PUNKS"), proxy.address)
//      const encodedMintData = await enc(cryptoPunksMarket.address, punkIndex);
//      const left = Order(accounts[2], Asset(id("CRYPTO_PUNKS"), encodedMintData, 1), ZERO, Asset(ETH, "0x", 100), 1, 0, 0, "0xffffffff", "0x");
//    	const right = Order(accounts[0], Asset(ETH, "0x", 100), ZERO, Asset(id("CRYPTO_PUNKS"), encodedMintData, 1), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//      return { left, right, leftSide, rightSide, matchFees };
//    }
//  })
//
//  describe("Check lazy with royalties", () => {
//
//		it("Transfer from  ERC721lazy to ERC20 ", async () => {
//		  const erc721Test = await ERC721LazyMintTest.new();
//		  const proxy = await ERC721LazyMintTransferProxy.new();
//		  await proxy.__OperatorRole_init();
//		  await proxy.addOperator(testing.address);
//		  await testing.setTransferProxy(id("ERC721_LAZY"), proxy.address)
//
//		  await t1.mint(accounts[2], 106);
//		  await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[2] });
//		  const encodedMintData = await erc721Test.encode([1, "uri", [[accounts[1], 0]], [[accounts[5], 2000], [accounts[6], 1000]], []]);
//
//		  const left = Order(accounts[1], Asset(id("ERC721_LAZY"), encodedMintData, 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//		  const right = Order(accounts[2], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(id("ERC721_LAZY"), encodedMintData, 1), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//		  assert.equal(await erc721Test.ownerOf(1), accounts[2]);
//		  assert.equal(await t1.balanceOf(accounts[1]), 67);
//		  assert.equal(await t1.balanceOf(accounts[2]), 3);
//		  assert.equal(await t1.balanceOf(accounts[5]), 20);
//		  assert.equal(await t1.balanceOf(accounts[6]), 10);
//		})
//
//		it("Transfer from  ERC1155lazy to ERC20 ", async () => {
//		  const erc1155Test = await ERC1155LazyMintTest.new();
//		  const proxy = await ERC1155LazyMintTransferProxy.new();
//		  await proxy.__OperatorRole_init();
//		  await proxy.addOperator(testing.address);
//		  await testing.setTransferProxy(id("ERC1155_LAZY"), proxy.address)
//
//		  await t1.mint(accounts[2], 106);
//		  await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[2] });
//		  const encodedMintData = await erc1155Test.encode([1, "uri", 5, [[accounts[1], 0]], [[accounts[5], 2000], [accounts[6], 1000]], []]);
//
//		  const left = Order(accounts[1], Asset(id("ERC1155_LAZY"), encodedMintData, 5), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//		  const right = Order(accounts[2], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(id("ERC1155_LAZY"), encodedMintData, 5), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//		  assert.equal(await erc1155Test.balanceOf(accounts[2], 1), 5);
//		  assert.equal(await t1.balanceOf(accounts[1]), 67);
//		  assert.equal(await t1.balanceOf(accounts[2]), 3);
//		  assert.equal(await t1.balanceOf(accounts[5]), 20);
//		  assert.equal(await t1.balanceOf(accounts[6]), 10);
//		})
//
//		it("Transfer from ETH to ERC721Lazy", async () => {
//		  const erc721Test = await ERC721LazyMintTest.new();
//		  const proxy = await ERC721LazyMintTransferProxy.new();
//		  await proxy.__OperatorRole_init();
//		  await proxy.addOperator(testing.address);
//		  await testing.setTransferProxy(id("ERC721_LAZY"), proxy.address)
//		  const encodedMintData = await erc721Test.encode([1, "uri", [[accounts[2], 0]], [[accounts[5], 2000], [accounts[6], 1000]], []]);
//
//      const left = Order(accounts[1], Asset(ETH, "0x", 100), ZERO, Asset(id("ERC721_LAZY"), encodedMintData, 1), 1, 0, 0, "0xffffffff", "0x");
//		  const right = Order(accounts[2], Asset(id("ERC721_LAZY"), encodedMintData, 1), ZERO, Asset(ETH, "0x", 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//      const ethSender = accounts[1];
//      await verifyBalanceChange(accounts[1], 103, () =>
//      	verifyBalanceChange(accounts[2], -67, () =>
//      	  verifyBalanceChange(accounts[5], -20, () =>
//      	    verifyBalanceChange(accounts[6], -10, () =>
//        	    verifyBalanceChange(protocol, -6, () =>
//        	      testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender,
//            	    {value: 103, from: ethSender, gasPrice: 0}
//            	  )
//            	)
//            )
//          )
//        )
//      );
//      assert.equal(await erc721Test.ownerOf(1), accounts[1]);
//		})
//
//		it("Transfer from ETH to ERC1155Lazy", async () => {
//		  const erc1155Test = await ERC1155LazyMintTest.new();
//		  const proxy = await ERC1155LazyMintTransferProxy.new();
//		  await proxy.__OperatorRole_init();
//		  await proxy.addOperator(testing.address);
//		  await testing.setTransferProxy(id("ERC1155_LAZY"), proxy.address)
//		  const encodedMintData = await erc1155Test.encode([1, "uri", 5, [[accounts[2], 0]], [[accounts[5], 2000], [accounts[6], 1000]], []]);
//
//      const left = Order(accounts[1], Asset(ETH, "0x", 100), ZERO, Asset(id("ERC1155_LAZY"), encodedMintData, 5), 1, 0, 0, "0xffffffff", "0x");
//		  const right = Order(accounts[2], Asset(id("ERC1155_LAZY"), encodedMintData, 5), ZERO, Asset(ETH, "0x", 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//      const ethSender = accounts[1];
//      await verifyBalanceChange(accounts[1], 103, () =>
//      	verifyBalanceChange(accounts[2], -67, () =>
//      	  verifyBalanceChange(accounts[5], -20, () =>
//      	    verifyBalanceChange(accounts[6], -10, () =>
//        	    verifyBalanceChange(protocol, -6, () =>
//        	      testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender,
//            	    {value: 103, from: ethSender, gasPrice: 0}
//            	  )
//            	)
//            )
//          )
//        )
//      );
//      assert.equal(await erc1155Test.balanceOf(accounts[1], 1), 5);
//		})
//
//	})
//
//  describe("Check doTransfers() with Royalties fees", () => {
//
//		it("Transfer from ERC721(RoyaltiesV1) to ERC20 , protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare721V1_20Orders(105)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[0]), 82);
//			assert.equal(await t1.balanceOf(accounts[2]), 10);
//			assert.equal(await t1.balanceOf(accounts[3]), 5);
//			assert.equal(await erc721V1.balanceOf(accounts[1]), 1);
//			assert.equal(await erc721V1.balanceOf(accounts[0]), 0);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		async function prepare721V1_20Orders(t1Amount = 105) {
//			await erc721V1.mint(accounts[0], erc721TokenId1, []);
//			await t1.mint(accounts[1], t1Amount);
//			await erc721V1.setApprovalForAll(transferProxy.address, true, {from: accounts[0]});
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
//
//			await royaltiesRegistry.setRoyaltiesByToken(erc721V1.address, [[accounts[2], 1000], [accounts[3], 500]]); //set royalties by token
//			const left = Order(accounts[0], Asset(ERC721, enc(erc721V1.address, erc721TokenId1), 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC721, enc(erc721V1.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees }
//		}
//
//		it("Transfer from ERC20 to ERC721(RoyaltiesV2), protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare20_721V2Orders(105)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[0]), 82);
//			assert.equal(await t1.balanceOf(accounts[2]), 10);
//			assert.equal(await t1.balanceOf(accounts[3]), 5);
//			assert.equal(await erc721V2.balanceOf(accounts[1]), 1);
//			assert.equal(await erc721V2.balanceOf(accounts[0]), 0);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		async function prepare20_721V2Orders(t1Amount = 105) {
//			await t1.mint(accounts[1], t1Amount);
//			await erc721V2.mint(accounts[0], erc721TokenId1, []);
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
//			await erc721V2.setApprovalForAll(transferProxy.address, true, {from: accounts[0]});
//
//			await royaltiesRegistry.setRoyaltiesByToken(erc721V2.address, [[accounts[2], 1000], [accounts[3], 500]]); //set royalties by token
//			const left = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC721, enc(erc721V2.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[0], Asset(ERC721, enc(erc721V2.address, erc721TokenId1), 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees }
//		}
//
//		it("Transfer from ERC1155(RoyaltiesV1) to ERC20, protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare1155V1_20Orders(8, 105)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[0]), 82);
//			assert.equal(await t1.balanceOf(accounts[2]), 10);
//			assert.equal(await t1.balanceOf(accounts[3]), 5);
//			assert.equal(await erc1155V1.balanceOf(accounts[1], erc1155TokenId1), 5);
//			assert.equal(await erc1155V1.balanceOf(accounts[0], erc1155TokenId1), 3);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		async function prepare1155V1_20Orders(t1Amount = 10, t2Amount = 105) {
//			await erc1155V1.mint(accounts[0], erc1155TokenId1, [], t1Amount);
//			await t1.mint(accounts[1], t2Amount);
//			await erc1155V1.setApprovalForAll(transferProxy.address, true, {from: accounts[0]});
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
//
//			await royaltiesRegistry.setRoyaltiesByToken(erc1155V1.address, [[accounts[2], 1000], [accounts[3], 500]]); //set royalties by token
//			const left = Order(accounts[0], Asset(ERC1155, enc(erc1155V1.address, erc1155TokenId1), 5), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC1155, enc(erc1155V1.address, erc1155TokenId1), 5), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees }
//		}
//
//		it("Transfer from ERC20 to ERC1155(RoyaltiesV2), protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare20_1155V2Orders(105, 8)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[0]), 82);
//			assert.equal(await t1.balanceOf(accounts[2]), 10);
//			assert.equal(await t1.balanceOf(accounts[3]), 5);
//			assert.equal(await erc1155V2.balanceOf(accounts[1], erc1155TokenId1), 6);
//			assert.equal(await erc1155V2.balanceOf(accounts[0], erc1155TokenId1), 2);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		it("Transfer from ERC20 to ERC1155(RoyaltiesV2), royalties are too high", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare20_1155V2Orders(105, 8, 2000, 3001)
//      const ethSender = ZERO;
//			await expectThrow(
//        testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender)
//			);
//		})
//
//		async function prepare20_1155V2Orders(t1Amount = 105, t2Amount = 10, account2Royalty = 1000, account3Royalty = 500) {
//			await t1.mint(accounts[1], t1Amount);
//			await erc1155V2.mint(accounts[0], erc1155TokenId1, [], t2Amount);
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
//			await erc1155V2.setApprovalForAll(transferProxy.address, true, {from: accounts[0]});
//
//			await royaltiesRegistry.setRoyaltiesByToken(erc1155V2.address, [[accounts[2], account2Royalty], [accounts[3], account3Royalty]]); //set royalties by token
//			const left = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC1155, enc(erc1155V2.address, erc1155TokenId1), 6), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[0], Asset(ERC1155, enc(erc1155V2.address, erc1155TokenId1), 6), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees }
//		}
//
//		it("Transfer from ETH to ERC1155V2, protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepareETH_1155V2Orders(10)
//      const ethSender = accounts[0];
//      	await verifyBalanceChange(accounts[0], 103, () =>
//        	verifyBalanceChange(accounts[1], -82, () =>
//        		verifyBalanceChange(accounts[2], -10, () =>
//        			verifyBalanceChange(accounts[3], -5, () =>
//          			verifyBalanceChange(protocol, -6, () =>
//          			  testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender,
//              			{value: 103, from: ethSender, gasPrice: 0}
//              		)
//        				)
//        			)
//        		)
//       		)
//      	);
//			assert.equal(await erc1155V2.balanceOf(accounts[0], erc1155TokenId1), 7);
//			assert.equal(await erc1155V2.balanceOf(accounts[1], erc1155TokenId1), 3);
//		})
//
//		async function prepareETH_1155V2Orders(t2Amount = 10) {
//			await erc1155V2.mint(accounts[1], erc1155TokenId1, [], t2Amount);
//			await erc1155V2.setApprovalForAll(transferProxy.address, true, {from: accounts[1]});
//			await royaltiesRegistry.setRoyaltiesByToken(erc1155V2.address, [[accounts[2], 1000], [accounts[3], 500]]); //set royalties by token
//			const left = Order(accounts[0], Asset(ETH, "0x", 100), ZERO, Asset(ERC1155, enc(erc1155V2.address, erc1155TokenId1), 7), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[1], Asset(ERC1155, enc(erc1155V2.address, erc1155TokenId1), 7), ZERO, Asset(ETH, "0x", 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees }
//		}
//
//		it("Transfer from ERC20 to ERC721(RoyaltiesV1 With Error), protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare20_721V1ErOrders(105)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[0]), 97);
//			assert.equal(await t1.balanceOf(accounts[2]), 0);
//			assert.equal(await t1.balanceOf(accounts[3]), 0);
//			assert.equal(await erc721V1_Error.balanceOf(accounts[1]), 1);
//			assert.equal(await erc721V1_Error.balanceOf(accounts[0]), 0);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		async function prepare20_721V1ErOrders(t1Amount = 105) {
//			await t1.mint(accounts[1], t1Amount);
//			await erc721V1_Error.mint(accounts[0], erc721TokenId1, [[accounts[2], 1000], [accounts[3], 500]]);
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
//			await erc721V1_Error.setApprovalForAll(transferProxy.address, true, {from: accounts[0]});
//
//			const left = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC721, enc(erc721V1_Error.address, erc721TokenId1), 1), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[0], Asset(ERC721, enc(erc721V1_Error.address, erc721TokenId1), 1), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees }
//		}
//
//		it("Transfer from ERC1155(RoyaltiesV2 With Error) to ERC20, protocol fee 6% (buyerFee3%, sallerFee3%)", async () => {
//			const { left, right, leftSide, rightSide, matchFees } = await prepare1155V2_20ErOrders(12, 105)
//      const ethSender = ZERO;
//      await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, ethSender);
//
//			assert.equal(await t1.balanceOf(accounts[1]), 2);
//			assert.equal(await t1.balanceOf(accounts[0]), 97);
//			assert.equal(await t1.balanceOf(accounts[2]), 0);
//			assert.equal(await t1.balanceOf(accounts[3]), 0);
//			assert.equal(await erc1155V2_Error.balanceOf(accounts[1], erc1155TokenId1), 5);
//			assert.equal(await erc1155V2_Error.balanceOf(accounts[0], erc1155TokenId1), 7);
//			assert.equal(await t1.balanceOf(protocol), 6);
//		})
//
//		async function prepare1155V2_20ErOrders(t1Amount = 12, t2Amount = 105) {
//			await erc1155V2_Error.mint(accounts[0], erc1155TokenId1, [[accounts[2], 1000], [accounts[3], 500]], t1Amount);
//			await t1.mint(accounts[1], t2Amount);
//			await erc1155V2_Error.setApprovalForAll(transferProxy.address, true, {from: accounts[0]});
//			await t1.approve(erc20TransferProxy.address, 10000000, { from: accounts[1] });
//
//			const left = Order(accounts[0], Asset(ERC1155, enc(erc1155V2_Error.address, erc1155TokenId1), 5), ZERO, Asset(ERC20, enc(t1.address), 100), 1, 0, 0, "0xffffffff", "0x");
//			const right = Order(accounts[1], Asset(ERC20, enc(t1.address), 100), ZERO, Asset(ERC1155, enc(erc1155V2_Error.address, erc1155TokenId1), 5), 1, 0, 0, "0xffffffff", "0x");
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//			return { left, right, leftSide, rightSide, matchFees }
//		}
//	})
//
//	describe("Catch emit event Transfer", () => {
//		it("From ETH(DataV1) to ERC721(DataV1) Protocol, check emit ", async () => {
//			const seller = accounts[1];
//			const sellerRoyaltiy = accounts[4];
//			const seller2 = accounts[3];
//			const buyer = accounts[2];
//			const originLeft1 = accounts[5];
//			const originLeft2 = accounts[6];
//			const originRight = accounts[7];
//			await testing.addOperator(buyer);
//
//			await erc721V1.mint(seller, erc721TokenId1, [[sellerRoyaltiy, 1000]]);
//    	await erc721V1.setApprovalForAll(transferProxy.address, true, {from: seller});
//
//			let addrOriginLeft = [[originLeft1, 500], [originLeft2, 600]];
// 			let addrOriginRight = [[originRight, 700]];
// 			let encDataLeft = await encDataV1([ [[buyer, 10000]], addrOriginLeft ]);
// 			let encDataRight = await encDataV1([ [[seller, 5000], [seller2, 5000]], addrOriginRight ]);
//
//			const left = Order(buyer, Asset(ETH, "0x", 200), ZERO, Asset(ERC721, enc(erc721V1.address, erc721TokenId1), 1), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
//    	const right = Order(seller, Asset(ERC721, enc(erc721V1.address, erc721TokenId1), 1), ZERO, Asset(ETH, "0x", 200), 1, 0, 0, ORDER_DATA_V1, encDataRight);
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//      let tx = await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, buyer,
//               {value: 300, from: buyer, gasPrice: 0});
//			let errorCounter = 0
////			eventEmitted  - run by amount transfer, for fix err. need all transfers failed
//			truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
//				let result = false;
//				switch (ev.to){
//					case protocol:
//						if ((ev.transferDirection != TO_TAKER) && (ev.transferType != PROTOCOL)) {
//							console.log("Error in protocol check:");
//							errorCounter++;
//						}
//					break
//					case seller:
//						if ((ev.transferDirection != TO_TAKER) && (ev.transferType != PAYOUT) ) {
//							console.log("Error in seller check:");
//							errorCounter++;
//						}
//					break
//					case sellerRoyaltiy:
//						if ((ev.transferDirection != TO_TAKER) && (ev.transferType != ROYALTY) ) {
//							console.log("Error in seller check:");
//							errorCounter++;
//						}
//					break
//					case seller2:
//						if ((ev.transferDirection != TO_TAKER) && (ev.transferType != PAYOUT) ) {
//							console.log("Error in seller2 check:");
//							errorCounter++;
//						}
//					break
//					case originLeft1:
//						if ((ev.transferDirection != TO_TAKER) && (ev.transferType != ORIGIN) ) {
//							console.log("Error in originLeft1 check:");
//							errorCounter++;
//						}
//					break
//					case originLeft2:
//						if ((ev.transferDirection != TO_TAKER) && (ev.transferType != ORIGIN) ) {
//							console.log("Error in originLeft2 check:");
//							errorCounter++;
//						}
//					break
//					case originRight:
//						if ((ev.transferDirection != TO_TAKER) && (ev.transferType != ORIGIN) ) {
//							console.log("Error in originRight check:");
//							errorCounter++;
//						}
//					break
//					case buyer:
//						if ((ev.transferDirection != TO_MAKER) && (ev.transferType != PAYOUT) ){
//							console.log("Error in buyer check:");
//							errorCounter++;
//						}
//					break
//				}
//				if (errorCounter > 0) {
//					result = false;
//				} else {
//					result = true;
//				}
//				return result;
//    	}, "Transfer shuold be emietted with correct parameters ");
//			assert.equal(errorCounter, 0); //фиксируем наличие ошибок тут
//    })
//
//		it("From ERC1155(DataV2) to ETH(DataV1) Protocol, check emit ", async () => {
//			const seller = accounts[1];
//			const sellerRoyaltiy = accounts[4];
//			const seller2 = accounts[3];
//			const buyer = accounts[2];
//			const originLeft1 = accounts[5];
//			const originLeft2 = accounts[6];
//			const originRight = accounts[7];
//
//      await testing.addOperator(buyer);
//			await erc1155V2.mint(seller, erc1155TokenId1, [[sellerRoyaltiy, 1000]], 10);
//    	await erc1155V2.setApprovalForAll(transferProxy.address, true, {from: seller});
//
//			let addrOriginLeft = [[originLeft1, 500], [originLeft2, 600]];
// 			let addrOriginRight = [[originRight, 700]];
// 			let encDataLeft = await encDataV1([ [[seller, 5000], [seller2, 5000]] , addrOriginLeft ]);
// 			let encDataRight = await encDataV1([ [[buyer, 10000]], addrOriginRight ]);
//
//			const left = Order(seller, Asset(ERC1155, enc(erc1155V2.address, erc1155TokenId1), 5), ZERO, Asset(ETH, "0x", 200), 1, 0, 0, ORDER_DATA_V1, encDataLeft);
//			const right = Order(buyer, Asset(ETH, "0x", 200), ZERO, Asset(ERC1155, enc(erc1155V2.address, erc1155TokenId1), 5), 1, 0, 0, ORDER_DATA_V1, encDataRight);
//      const leftSide = await testing.getDealSide.call(left);
//      const rightSide = await testing.getDealSide.call(right);
//      const matchFees = await testing.getFeeSide.call(left, right);
//      let tx = await testing.doTransfers(leftSide, rightSide, matchFees.feeSide, buyer,
//               {value: 300, from: buyer, gasPrice: 0});
//
//			let errorCounter = 0
////			eventEmitted  - срабатывает по нескольким transfer, для фиксации ошибки нужно чтоб все трансферы завалились
//			truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
//				let result = false;
//				switch (ev.to){
//					case protocol:
//						if ((ev.transferDirection != TO_MAKER) && (ev.transferType != PROTOCOL)) {
//							console.log("Error in protocol check:");
//							errorCounter++;
//						}
//					break
//					case seller:
//						if ((ev.transferDirection != TO_MAKER) && (ev.transferType != PAYOUT) ) {
//							console.log("Error in seller check:");
//							errorCounter++;
//						}
//					break
//					case sellerRoyaltiy:
//						if ((ev.transferDirection != TO_MAKER) && (ev.transferType != ROYALTY) ) {
//							console.log("Error in seller check:");
//							errorCounter++;
//						}
//					break
//					case seller2:
//						if ((ev.transferDirection != TO_MAKER) && (ev.transferType != PAYOUT) ) {
//							console.log("Error in seller2 check:");
//							errorCounter++;
//						}
//					break
//					case originLeft1:
//						if ((ev.transferDirection != TO_MAKER) && (ev.transferType != ORIGIN) ) {
//							console.log("Error in originLeft1 check:");
//							errorCounter++;
//						}
//					break
//					case originLeft2:
//						if ((ev.transferDirection != TO_MAKER) && (ev.transferType != ORIGIN) ) {
//							console.log("Error in originLeft2 check:");
//							errorCounter++;
//						}
//					break
//					case originRight:
//						if ((ev.transferDirection != TO_MAKER) && (ev.transferType != ORIGIN) ) {
//							console.log("Error in originRight check:");
//							errorCounter++;
//						}
//					break
//					case buyer:
//						if ((ev.transferDirection != TO_TAKER) && (ev.transferType != PAYOUT) ){
//							console.log("Error in buyer check:");
//							errorCounter++;
//						}
//					break
//				}
//				if (errorCounter > 0) {
//					result = false;
//				} else {
//					result = true;
//				}
//				return result;
//    	}, "Transfer shuold be emietted with correct parameters ");
//			assert.equal(errorCounter, 0); //фиксируем наличие ошибок тут
//    })
//
//	}) //Catch emit event Transfer
});