# DAO Voting

>This project implements a voting system using ERC 20 tokens. The repository includes a voting contract, a voting token, and a betting contract for testing functionality. Tasks, tests and scripts for the deployment of contracts are also presented here.
-------------------------
# Table of contents
1. <b>Deploying</b>
  + [Deploy vote token](#Deploy-vote-token)
  + [Deploy DAO voting contract](#Deploy-voting-contract)
  + [Connect voting token to voting contract](#Connect)
2. <b>DAO voting functions</b>
  + [Deposit](#Deposit)
  + [Add proposal](#Add-proposal)
  + [Vote](#Vote)
  + [Delegate vote](#Delegate)
  + [Finish voting](#Finish)
3. <b>Information functions</b>
  + [Voting information](#Voting-info)
  + [User balance](#User-balance)
  + [Settings information](#Settings-info)
4. <b>Other functions</b>
  + [Mint vote tokens](#Mint)

-------------------------
## 1. Deploying

#### <a name="Deploy-vote-token"></a> <b>- Deploy vote token</b> (after executing this command you'll see vote token's address in terminal, address will be added to .env file): 
```shell
npx hardhat run scripts/deployToken.ts
```

#### <a name="Deploy-voting-contract"></a> <b>- Deploy DAO voting contract</b> (after executing this command you'll see voting contract's address in terminal, address will be added to .env file):
```shell
npx hardhat run scripts/deployVoting.ts
```

#### <a name="Connect"></a> <b>- Connect voting token to voting contract</b>: 
```shell
npx hardhat connect
```
-------------------------

## 2. DAO voting functions
#### <a name="Deposit"></a> <b>- Deposit </b>(this function sends the selected number of tokens to the contract):
```shell
Usage: hardhat [GLOBAL OPTIONS] deposit --amount <STRING>

OPTIONS:

  --amount      Amount of tokens 


Example:

npx hardhat deposit --amount 15000
```

#### <a name="Add-proposal"></a> <b>- Add proposal</b> (this function creates a new vote (can be called only by chairperson)):</b>
>The validity period and the minimum number of votes for a successful vote is set in the "deployVoting.ts" file and is changed only by voting. Calldata, parameters and description for creating a new vote are set in the file "proposal_params.ts" in the root folder
```shell
Usage: hardhat [GLOBAL OPTIONS] addpr --recipient <STRING>

OPTIONS:

  --recipient   The contract on which the function will be called after the voting is completed 


Example:

npx hardhat addpr --recipient 0x8Fb1341Ec92eF0077a5106fde4c6fa77687FdA2d
```

#### <a name="Vote"></a> <b>- Vote</b> (this function is used to vote for or against in the selected vote):</b>

```shell
Usage: hardhat [GLOBAL OPTIONS] vote --choice <STRING> --pid <STRING>

OPTIONS:

  --choice      1 - vote for proposal, 0 - against 
  --pid         Proposal ID 


Example:

npx hardhat vote --choice 1 --pid 42
```

#### <a name="Delegate-vote"></a> <b>- Delegate vote</b> (this function is used to delegate your vote to another user):</b>

```shell
Usage: hardhat [GLOBAL OPTIONS] delegate --pid <STRING> --to <STRING>

OPTIONS:

  --pid Proposal ID 
  --to  Delegate's address


Example:

npx hardhat delegate --to 0x5A31ABa56b11cc0Feae06C7f907bED9Dc1C02f95 --pid 41
```

#### <a name="Finish"></a> <b>- Finish voting</b> (this function finishes the voting):</b>

```shell
Usage: hardhat [GLOBAL OPTIONS] finish --pid <STRING>

OPTIONS:

  --pid Proposal ID


Example:

npx hardhat finish --pid 42
```
-------------------------

## 3. Information functions

#### <a name="Voting-info"></a> <b>- Voting information</b> (this function outputs voting information to the terminal):

```shell
Usage: hardhat [GLOBAL OPTIONS] vinfo --pid <STRING>

OPTIONS:

  --pid Proposal ID 


Example:

npx hardhat vinfo --pid 43
```

#### <a name="User-balance"></a> <b>- User balance</b> (this function outputs balance of selected user to the terminal):

```shell
Usage: hardhat [GLOBAL OPTIONS] balance --user <STRING>

OPTIONS:

  --user        Address of user 


Example:

npx hardhat balance --user 0x5A31ABa56b11cc0Feae06C7f907bED9Dc1C02f95
```

#### <a name="Settings-info"></a> <b>- Settings information</b> (this function outputs settings of voting contract to the terminal):

```shell
Usage: hardhat [GLOBAL OPTIONS] sinfo


Example:

npx hardhat sinfo
```
-------------------------

## 4. Other functions

#### <a name="Mint"></a> <b>- Mint vote tokens</b> (this function sends vote tokens to selected account (can be called only by token contract owner)):

```shell
Usage: hardhat [GLOBAL OPTIONS] mint --amount <STRING> --to <STRING>

OPTIONS:

  --amount      Amount of tokens 
  --to          Receiver of tokens 


Example:

npx hardhat mint --to 0x5A31ABa56b11cc0Feae06C7f907bED9Dc1C02f95 --amount 30000
```