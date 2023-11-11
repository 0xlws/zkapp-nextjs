"use client";
import React, { useState, useEffect } from "react";
import { PrivateKey, fetchAccount, Mina, PublicKey, Field } from "o1js";

let SimpleZkApp;

(async () => {
  try {
    // Use dynamic import to load the SimpleZkApp module
    const zkAppModule = await import("../contracts/SimpleZkApp.js");
    SimpleZkApp = zkAppModule.SimpleZkApp;
    // Additional initialization if needed
  } catch (error) {
    console.error("Error importing SimpleZkApp:", error);
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

  useEffect(() => {
    console.log({ transaction });
  }, [publicKey, privateKey, transaction, accountBalance]);

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
      // console.log(first)
      let zkApp = new SimpleZkApp(publicKey);
      console.log({ zkApp });
      let value = zkApp.value.get();
      console.log(zkApp.value);
      setZkappState(value.toBase58());
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
    console.log(SimpleZkApp);
    const { verificationKey } = await SimpleZkApp.compile();
    console.log("Verification key: ", verificationKey);
  };

  const createTransaction = async () => {
    try {
      // unfortunately, have to create the object once again, because ref does not work.
      let feePayerKey = privateKey;
      let feepayerAddress = feePayerKey.toPublicKey();
      let zkApp = new SimpleZkApp(publicKey);

      // setTransaction
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
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-white">
        <div className="w-full max-w-4xl p-8 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              NextJS TailwindCSS + ZK [WIP]
            </h2>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div>
              <h4>Public Key:</h4>
              <p className="text-sm">{JSON.stringify(publicKey)}</p>
            </div>

            <h2 className="text-xl font-semibold">
              Follow the steps to prove you know the answer and store it
              on-chain:
            </h2>

            <div className="flex flex-col items-center space-y-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                onClick={checkAccountBalance}
              >
                Check Funds
              </button>

              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                onClick={() => getZkAppState()}
              >
                Check State
              </button>

              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                onClick={compileZkApp}
              >
                Compile Contract
              </button>

              <div>
                <input
                  className="border border-gray-300 bg-white text-black px-4 py-2 mr-2 rounded"
                  placeholder="10 / 2 + 2 = ?"
                  value={equationAnswer}
                  onChange={(e) => setEquationAnswer(e.target.value)}
                />
                <button
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  onClick={() => createTransaction()}
                >
                  Call
                </button>
              </div>

              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                onClick={createProof}
              >
                Create Proof
              </button>

              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                onClick={broadcastTransaction}
              >
                Broadcast
              </button>
            </div>
          </div>

          <div className="overflow-auto bg-neutral-800 rounded-lg shadow-inner max-h-48 p-4">
            <h3 className="text-lg font-semibold mb-2">Status Messages:</h3>

            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(accountBalance, null, 2)}
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyZkApp;
