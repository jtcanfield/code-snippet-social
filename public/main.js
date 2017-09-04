//Statistics Page
var fullstats = document.getElementById("fullstatistics");
if (fullstats !== null){
  var jsonObject = JSON.parse(fullstats.textContent);
  fullstats.innerHTML = "";
  jsonObject.map((user) => {
    var newliteral = document.createElement("div");
    newliteral.setAttribute("class", "playerstats");
    let holder = `
      <h2><a href="/profile${user.username}">${user.username}</a></h2>
      <p>Games: ${user.games}  Wins: ${user.wins} Losses: ${user.losses}</p>
      <p>Avg Word Length: ${(user.wordlengths.reduce((a,b) => a+b, 0))/user.wordlengths.length}</p>
      <p>Avg Time: ${timecalc((user.times.reduce((a,b) => a+b, 0))/user.times.length)}</p>
    `;
    newliteral.innerHTML = holder;
    fullstats.appendChild(newliteral);
  })
}
//Profile Page
var profilepage = document.getElementById("profilepageinfo");
if (profilepage !== null){
  var jsonObjectarray = JSON.parse(profilepage.textContent);
  var jsonObject = jsonObjectarray[0];
  profilepage.innerHTML = "";
  var newliteral = document.createElement("div");
  newliteral.setAttribute("class", "playerstats");
  let holder = `
    <h1>${jsonObject.username}</h1>
    <div>
      <span>Games: ${jsonObject.games}</span><span>Wins: ${jsonObject.wins}</span><span>Losses: ${jsonObject.losses}</span>
    </div>
    <p>Avg Word Length: ${(jsonObject.wordlengths.reduce((a,b) => a+b, 0))/jsonObject.wordlengths.length}</p>
    <p>Avg Time: ${timecalc((jsonObject.times.reduce((a,b) => a+b, 0))/jsonObject.times.length)}</p>
    <h3>Game History:</h3>
  `;
  newliteral.innerHTML = holder;
  for (let i = 0; i < jsonObject.words.length; i++){
    let historyholder = `
      <div>
        <span>${jsonObject.gamestatus[i]}</span><span>Word: ${jsonObject.words[i]}</span><span>Time Taken: ${timecalc(jsonObject.times[i])}</span>
      </div>
    `;
    newliteral.innerHTML += historyholder;
  }
  profilepage.appendChild(newliteral);
}
