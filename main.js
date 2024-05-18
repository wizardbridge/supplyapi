const BigNumber = require("bignumber.js");
const axios = require("axios");
const express = require("express");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Function to fetch data from the API
async function fetchData(moduleName, action, params) {
  const baseUrl = "https://api.basescan.org";
  const apiKey = "";
  const apiUrl = `${baseUrl}/api`;

  const queryParams = new URLSearchParams();
  queryParams.append("module", moduleName);
  queryParams.append("action", action);
  queryParams.append("apikey", apiKey);

  for (const [key, value] of Object.entries(params)) {
    queryParams.append(key, value);
  }

  const queryUrl = `${apiUrl}?${queryParams.toString()}`;
  console.log(queryUrl);
  try {
    const response = await axios.get(queryUrl);
    console.log(response.data);
    if (response.data) {
      return response.data.result;
    } else {
      console.log("Data not found in response.");
      return null;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

async function calculateRemainingSupply() {
  const moduleName = "stats";
  const ethSupplyAction = "tokensupply";
  const ethGetBalanceAction = "tokenbalance";
  const deadAddress = "0x000000000000000000000000000000000000dEaD";
  const wpwrAddress = "0x4200000000000000000000000000000000000006";
  const contractaddress = "0x6f1864BCe4098540C012cDD5f39e65d004c88285";
  const block = "latest";

  const totalSupplyWei = new BigNumber(
    await fetchData(moduleName, ethSupplyAction, {
      contractaddress,
    })
  );
  await sleep(5000);

  const deadBalanceWei = new BigNumber(
    await fetchData("account", ethGetBalanceAction, {
      address: deadAddress,
      contractaddress,
      block,
    })
  );
  await sleep(5000);

  const wpwrBalanceWei = new BigNumber(
    await fetchData("account", ethGetBalanceAction, {
      address: wpwrAddress,
      contractaddress,
      block,
    })
  );

  const remainingSupplyWei = totalSupplyWei.minus(deadBalanceWei);

  console.log("Wpwr Balance in Wei:", wpwrBalanceWei.toString());
  console.log("Remaining Supply in Wei:", remainingSupplyWei.toString());

  const wpwrBalanceEther = wpwrBalanceWei.dividedBy(new BigNumber("1e18"));
  const remainingSupplyEther = remainingSupplyWei.dividedBy(
    new BigNumber("1e18")
  );

  const totalBalanceEther = remainingSupplyEther.plus(wpwrBalanceEther);
  return totalBalanceEther.toString();
}

const app = express();

app.get("/", async (req, res) => {
  const data = await calculateRemainingSupply();
  return res.send(data.toString());
});

app.get("/base", async (req, res) => {
  const data = await calculateRemainingSupply();
  return res.send(data.toString());
});

// Listen on port 3003
app.listen(3003, () => {
  console.log("listening at http://localhost:3003");
});
