const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; font-family: sans-serif; background: #333; color: white; display: flex; flex-direction: column; align-items: center; }
  .container { position: relative; width: 794px; height: 1123px; background: white; margin-top: 20px; cursor: crosshair; }
  .img { position: absolute; inset: 0; width: 100%; height: 100%; }
  .marker { position: absolute; background: red; width: 4px; height: 4px; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; }
  .info { position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 4px; pointer-events: none; z-index: 1000; }
  .nav { margin-top: 20px; }
  button { padding: 10px 20px; margin: 0 10px; cursor: pointer; }
</style>
</head>
<body>
  <div class='nav'>
    <button onclick='changeImage("Al Ghani.png")'>Al Ghani</button>
    <button onclick='changeImage("Al Shareef.png")'>Al Shareef</button>
    <button onclick='changeImage("king enterprise.png")'>King</button>
  </div>
  <div class='info' id='info'>Click to get coordinates</div>
  <div class='container' id='container' onclick='handleClick(event)'>
    <img src='/Al Ghani.png' class='img' id='img' />
  </div>
  <script>
    function changeImage(name) {
      document.getElementById('img').src = '/' + name;
    }
    function handleClick(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pctX = ((x / rect.width) * 100).toFixed(2);
      const pctY = ((y / rect.height) * 100).toFixed(2);
      const info = document.getElementById('info');
      info.innerText = \`X: \${pctX}% | Y: \${pctY}%\`;
      
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.style.left = pctX + '%';
      marker.style.top = pctY + '%';
      e.currentTarget.appendChild(marker);
    }
  </script>
</body>
</html>
`;
const fs = require('fs');
fs.writeFileSync('d:\\managmeeent\\bills\\public\\measure.html', html);
console.log('Created measure.html');
