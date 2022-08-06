console.clear();
require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    ContractCallQuery,
    Hbar,
} = require("@hashgraph/sdk");
const fs = require("fs");
const { connect } = require("http2");

// connect Wallet (Meta Mask)
// var web3;
// async function connect(){
//     await window.web3.currentProvider.enabe();
//     web3 = new web3(window.web3.currentProvider);
// }




 function callvalues() {
 var sender = "ishabh";

  var sender = document.getElementById("sname").value;
    
    var reciever = document.getElementById("rname").value;
     var senderaddr = document.getElementById("saddr").value;
    var recieveraddr = document.getElementById("raddr").value;
     var AmtTransfer = document.getElementById("AmtTransfer").value;
     var GFees = document.getElementById("GFees").value;

     document.writeln("Amount is Transfered Succesfully" + "<br>" + "<br>");
     document.writeln("Reciept Details" + "<br>" + "<br>" + "Your Name:" + sender+"<br>");
     document.writeln("The Sender Address is:" + senderaddr + "<br>" + "<br>");
     document.writeln("Reciever Name:" + reciever + "<br>");
     document.writeln("The Receiver Address is :" + recieveraddr + "<br>" + "<br>");
     document.writeln("Transfered Amount is :" + AmtTransfer + "<br>" + "<br>");
     document.writeln("Your Total Gas Fees :" + GFees + "<br>" );
     let a = main();
     console.log(sender);
    
 }

// Configure accounts and client
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function main() {
    
    await fs.readFileSync("LookuContract_sol_LookupContract.bin");
    // Import the compiled contract bytecode
    const contractBytecode = fs.readFileSync("LookuContract_sol_LookupContract.bin");

    // Create a file on Hedera and store the bytecode
    const fileCreateTx = new FileCreateTransaction()
        .setContents(contractBytecode)
        .setKeys([operatorKey])
        .freezeWith(client);
    const fileCreateSign = await fileCreateTx.sign(operatorKey);
    const fileCreateSubmit = await fileCreateSign.execute(client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateRx.fileId;
    console.log(`- The bytecode file ID is: ${bytecodeFileId} \n`);

    // Instantiate the smart contract
    const contractInstantiateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId)
        .setGas(100000)
        .setConstructorParameters(
            new ContractFunctionParameters().addString("Ben").addUint256(111111)
        );
    const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
    const contractId = contractInstantiateRx.contractId;
    const contractAddress = contractId.toSolidityAddress();
    console.log(`-the sender name is: ${"Ben"}\n`);
    console.log(`- The smart contract ID is: ${contractId} \n`);
    console.log(`- The smart contract ID in Solidity format is: ${contractAddress} \n`);
    
    // Query the contract to check changes in state variable
    const contractQueryTx = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Ben"));
    const contractQuerySubmit = await contractQueryTx.execute(client);
    const contractQueryResult = contractQuerySubmit.getUint256(0);
    console.log(`- Here's Your Wallet Address: ${contractQueryResult} \n`);

    // Call contract function to update the state variable
    const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
            "setMobileNumber",
            new ContractFunctionParameters().addString("David").addUint256(222222)
        );
    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
    console.log(`- Contract function call status: ${contractExecuteRx.status} \n`);

    // Query the contract to check changes in state variable
    const contractQueryTx1 = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("David"));
    const contractQuerySubmit1 = await contractQueryTx1.execute(client);
    const contractQueryResult1 = contractQuerySubmit1.getUint256(0);
    console.log(`- the Receiver name is: ${"David"}\n`);
    console.log(`- Reciever Wallet Address: ${contractQueryResult1} \n`);

}
main();
