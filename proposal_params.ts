export const jsonAbi = [{
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_freezeTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_rewardsPercent",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_rewardsFrequency",
        "type": "uint256"
      }
    ],
    "name": "changeSettings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }];

export const parameters = [10, 10, 10];

export const description = "Changes parameters in staking contract";
