const API_URL = "https://api.coingecko.com/api/v3";
const ctx = document.getElementById("priceChart").getContext("2d");
let chart;
let selectedCoin = null;

async function fetchCoins() {
  const res = await fetch(`${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1`);
  const coins = await res.json();
  const list = document.getElementById("crypto-list");
  list.innerHTML = "";

  coins.forEach(coin => {
    const div = document.createElement("div");
    div.className = "bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 cursor-pointer";
    div.innerHTML = `
      <div class="flex items-center space-x-3">
        <img src="${coin.image}" alt="${coin.name}" class="w-8 h-8">
        <h3 class="text-lg font-bold">${coin.name}</h3>
      </div>
      <p>💲 ${coin.current_price.toLocaleString()}</p>
      <p class="${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}">
        ${coin.price_change_percentage_24h.toFixed(2)}%
      </p>
      <p>MC: $${(coin.market_cap/1e9).toFixed(2)}B</p>
    `;
    div.onclick = () => showChart(coin.id, 1);
    list.appendChild(div);
  });
}

async function showChart(coinId, days = 1) {
  if (!coinId) return alert("Selecione uma moeda primeiro!");
  selectedCoin = coinId;
  const res = await fetch(`${API_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=hourly`);
  const data = await res.json();

  const prices = data.prices;
  const labels = prices.map(p => new Date(p[0]).toLocaleString());
  const values = prices.map(p => p[1]);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${coinId} (${days}D)`,
        data: values,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

fetchCoins();
setInterval(fetchCoins, 60000); // atualiza lista a cada 1 min
