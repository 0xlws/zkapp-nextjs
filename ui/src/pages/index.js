"use client";
import React, { useState, useEffect } from "react";
import { PrivateKey, fetchAccount, Mina, PublicKey, Field } from "o1js";

let SimpleZkapp;

(async () => {
  try {
    // Use dynamic import to load the SimpleZkapp module
    const zkAppModule = await import("../../../contracts/build/src");
    SimpleZkapp = zkAppModule.SimpleZkapp;
    // Additional initialization if needed
  } catch (error) {
    console.error("Error importing SimpleZkapp:", error);
  }
})();

const prefundedAccounts = [
  [
    "B62qonTvKWLXDEzr4sLuyE9NgkzNN8XivSUYKryckyYdSrEJREwVmX7",
    "EKFA4EGPvvK1TpPrjMJPpWKR1U24UQLuqxPpiXM7fJbTfLiyXutZ",
  ],
  [
    "B62qp1jy6CmFevfJJnqP4yiEDiSmEXYYQ5FckHUeMCtnEupWZAvU9qG",
    "EKFA8GDQUcd8MzggFWMLrKTUxgFKTkFZmyUatQukP1mn3LJxD6Aw",
  ],
  [
    "B62qixjXfKP3N9KXEhnSQ9hHEmBwjEjjgnryFmSHJBK2KBodvGdQh2A",
    "EKEHncSQMWugRfpbLYyHVDUdRc86XEkC1EbKfWH6YrXpcRftxecx",
  ],
  [
    "B62qmqGq3EmzYXfSifJRRkbRfx6RHuiDw3fCgCXygg3xKASAi431RP2",
    "EKF2PVhdFTUtdJTQ1XWUw4ccncM3U2PuEyLyPDcNHLJEqY5fQCXr",
  ],
  [
    "B62qiziFbwu65PWMYgx1rvDLqxSau9fMsvpq6FuhgEUBCoBQQYNmVGK",
    "EKFHAMkPPU3WLqHRvzf4Ri1smXuk3ydKA8jSyyukKJbbPe1cCjba",
  ],
];

const zkAppAddress = "B62qrxp6zwJAYiQQqAi88izJ1KmVfGjra3HUwsZFoC9ptPZ6UVYdd7o";

const MyZkApp = () => {
  const [loadingO1js, setLoadingO1js] = useState(true);
  const graphqlEndpoint = "https://proxy.berkeley.minaexplorer.com/graphql";
  const fee = Number(0.1) * 1e9; // Replace with your actual fee calculation

  const [notification, setNotification] = useState({ message: "", type: "" });

  const [status, setStatus] = useState("");

  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [equationAnswer, setEquationAnswer] = useState("");
  const [zkappState, setZkappState] = useState("");

  const [transaction, setTransaction] = useState("");

  useEffect(() => {}, [publicKey, privateKey, transaction, accountBalance]);

  useEffect(() => {
    const initializeO1js = async () => {
      setStatus({ message: "Loading", type: "success" });
      setPublicKey(PublicKey.fromBase58(prefundedAccounts[0][0]));
      setPrivateKey(PrivateKey.fromBase58(prefundedAccounts[0][1]));

      setLoadingO1js(false);

      // Create Berkeley connection
      const Network = Mina.Network(graphqlEndpoint);
      console.log({ Network });

      Mina.setActiveInstance(Network);

      // Update the message or close it, based on your notification system
      setStatus({
        message: "Ready to interact with berkeley!",
        type: "info",
      });
    };

    initializeO1js();
  }, []); // Empty dependency array ensures this runs only once after the initial render

  if (loadingO1js) {
    return <div>Loading O1js...</div>;
  }

  // const generateNewKeys = () => {
  //   const privateKey_ = PrivateKey.random();
  //   setPrivateKey(privateKey_.toBase58());
  //   setPublicKey(PublicKey.fromBase58(prefundedAccounts[1][0]));
  // };

  const checkAccountBalance = async () => {
    // Check for the existence of the publicKey before making the request
    if (!publicKey) {
      setStatus("Generate or input a key pair!");
      return;
    }

    setLoading(true); // Start loading state
    try {
      // Attempt to fetch the account information
      const { account } = await fetchAccount({ publicKey: publicKey });

      // Check if 'account' has been returned successfully
      if (account) {
        console.log({ account }); // Log the account object
        setAccountBalance(account.balance); // Update the balance in your state
        setStatus(`Balance updated: ${account.balance}`); // Display success notification
      } else {
        // Account not found or 'account' is undefined
        setStatus("Account not found. Please check the provided key pair.");
      }
    } catch (e) {
      console.error(e); // Log any errors to the console
      setStatus("An error occurred while fetching the account balance."); // Notify the user of the error
    } finally {
      setLoading(false); // End loading state
    }
  };
  const getZkAppState = async () => {
    // Attempt to convert base58 address to a PublicKey and fetch the associated account
    setStatus("Fetching zkApp state..."); // Inform the user
    try {
      let { account, error } = await fetchAccount({ publicKey });

      // Log the responses for debugging
      console.log("account", JSON.stringify(account, null, 2));
      console.log("error", JSON.stringify(error, null, 2));

      // Check for any error during fetchAccount
      if (error) {
        setStatus("Error fetching account. See console for more details.");
        return;
      }

      if (!account) {
        setStatus("Account not found for the given zkApp address.");
        return;
      }

      // Create the zkapp object and get its state
      let zkApp = new SimpleZkapp(publicKey); // Assume SimpleZkapp takes a PublicKey
      let value = zkApp.value.get(); // Get the zkApp state value; assuming this is synchronous
      setZkappState(value.toBase58()); // Set the zkApp state in your application state
      setStatus(`Found deployed zkApp, with state ${value.toBase58()}`); // Inform the user
    } catch (error) {
      // Catch any other errors that could occur and log to the console
      console.error(error);
      setStatus(
        "An error occurred while processing the zkApp. See console for more details."
      );
    }
  };

  const compileZkApp = async () => {
    console.warn(
      `This will take a while. Arm yourself with patience. The browser might not respond for a while...`
    );
    alert(
      `This will take a while. Arm yourself with patience. The browser might not respond for a while...`
    );

    const n = setStatus({
      title: "Why compile?",
      content: `Typically, smart contracts reside on the blockchain, and you invoke their functions by sending transactions. The network's nodes then execute these functions for you.
    \nHowever, in the case of Mina, we take a different approach. Instead of relying on the network to execute our smart contract, we fetch the contract, compile it and run locally. This means we can run it in our own local environment, like a web browser, without requiring the network nodes to handle the execution.`,
    });

    // compile the zkapp
    console.log("before compiling");
    console.log("Compiling zk program...");
    console.log(SimpleZkapp);
    const { verificationKey } = await SimpleZkapp.compile();
    console.log("Verification key: ", verificationKey);
  };

  const createTransaction = async (zkAppAddress) => {
    console.log({ zkAppAddress });

    try {
      // unfortunately, have to create the object once again, because ref does not work.
      let feePayerKey = privateKey;
      let feepayerAddress = feePayerKey.toPublicKey();
      let zkApp = new SimpleZkapp(publicKey);

      // setTransaction(
      const transaction = await Mina.transaction(
        { sender: feepayerAddress, fee },
        () => {
          zkApp.giveAnswer(Field(equationAnswer), feepayerAddress);
        }
      );

      setTransaction(transaction);

      alert("You have got the correct answer to the equation and ...", {
        duration: 10000,
      });
      alert(
        "You have successfully generated a transaction. \nBut we have not sent it yet! Before doing that, we have to generate a proof.",
        { duration: 10000 }
      );
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const createProof = async () => {
    alert(
      "This will take a while. Arm yourself with patience. The browser might not respond for a while..."
    );

    setStatus({
      title: "Why do we need a proof?",
      content: `A generated proof is a long string containing a cryptographic confirmation that you indeed executed this zkApp method in your browser.
      \nYou will send a transaction that will modify an on-chain value only if you possess both the answer to the equation and the proof of the zkApp method execution.`,
    });

    try {
      await transaction.prove();
      console.log(
        "Full proof: ",
        transaction.transaction.accountUpdates[0].authorization.proof
      );
    } catch (error) {
      console.log(error);
      return;
    }

    setStatus({
      title: "Congratulations, you have successfully produced the proof!",
      content:
        "Here is how it looks like: \n\n" +
        transaction.transaction.accountUpdates[0].authorization.proof.slice(
          0,
          150
        ) +
        " ...",
    });
  };

  const broadcastTransaction = async () => {
    // send the transaction to the graphql endpoint
    console.log("Sending the transaction...");
    try {
      let feePayerKey = privateKey;
      let sendZkapp = await transaction.sign([feePayerKey]).send();
      console.log(sendZkapp);
      let txHash = await sendZkapp.hash();
      console.log(txHash);
      alert(
        "Transaction send. The state of the smart contract will be updated after transaction is included into the next block!",
        { duration: 10000 }
      );
      setStatus({
        title: "Follow your transaction in blockexplorer",
        content:
          "Transaction hash: " +
          txHash +
          "\n\n" +
          "https://berkeley.minaexplorer.com/",
      });
    } catch (error) {
      return;
    }
  };

  return (
    <>
      <div className="max-h-screen flex flex-col justify-center items-center overflow-hidden">
        <div className="flex max-h-[50px] justify-center items-center w-full bg-gray-800 text-white">
          <h2 className="text-2xl font-bold mb-4">
            {/* Before we start, make sure you have an account with some Mina in it */}
            DEMO WIP
          </h2>
        </div>

          {/* <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Generate new key pair
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Randomly pick keys from one of prefunded accounts
          </button> */}

  
          {/* <div className="flex items-center space-x-2">
          <label className="block">private key:</label>
          <input
            className="border p-2"
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />
        </div> */}

          <div className="flex flex-col justify-center items-center  my-8 border-t border-gray-200 pt-4 mt-2">
          <div className="space-x-2">
            <label className="block">public key: </label>
            <div>{JSON.stringify(publicKey)}</div>
            {/* <input
            className="border p-2"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
          /> */}
          </div>

            <h2 className="text-2xl font-bold mb-4">
              Follow the steps to prove you know the answer and store it
              on-chain:
            </h2>

            <div className="space-y-4 mt-2">
              {/* Step 1: Check if selected account has enough funds */}
              <div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={checkAccountBalance}
                >
                  Check Funds
                </button>
                <div>{JSON.stringify(accountBalance)}</div>
              </div>

              {/* Step 2: Check the smart contract state on-chain */}
              <div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => getZkAppState()}
                >
                  Check State
                </button>
                {/* <p className="bg-gray-200 p-4 rounded mt-2">{zkappState || ""}</p> */}
                <div>{JSON.stringify(status)}</div>
              </div>

              {/* Step 3: Compile the smart contract */}
              <div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={compileZkApp}
                >
                  Compile Contract
                </button>
              </div>

              {/* Step 4: Call the smart contract method */}
              <div>
                <input
                  className="border p-2 mr-2"
                  placeholder="10 / 2 + 2 = ?"
                  value={equationAnswer}
                  onChange={(e) => setEquationAnswer(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => createTransaction()}
                >
                  Call
                </button>
              </div>

              {/* Step 5: Create the zero-knowledge proof */}
              <div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={createProof}
                >
                  Create Proof
                </button>
              </div>

              {/* Step 6: Broadcast the transaction to the network */}
              <div>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={broadcastTransaction}
                >
                  Broadcast
                </button>
              </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default MyZkApp;
