const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC'));

// Replace with your Jetton's master contract address
const dogsContractAddress = "EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS"; // The Jetton master contract address

// Initialize the Jetton Minter contract
const dogsContract = new TonWeb.token.jetton.JettonMinter(tonweb.provider, {
    address: new TonWeb.utils.Address(dogsContractAddress)
});
dogsContract.getJettonData().then(r => {
    console.log(r.adminAddress.toString())
})
dogsContract.getJettonWalletAddress(new TonWeb.utils.Address("UQBBPF6ugQVzhWdZR5_VfCEMTMGRjo0SStjI70sC5L7S7GGY")).then(r => {
    console.log("WALLET", r.toString())
})
