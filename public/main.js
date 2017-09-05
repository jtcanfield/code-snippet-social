document.addEventListener("DOMContentLoaded", function() {




//Front Page
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
var profilepage = document.getElementById("profilesnippets");
if (profilepage !== null){
  var arrayOfSnips = JSON.parse(profilepage.textContent);
  profilepage.innerHTML = "";
  var newliteral = document.createElement("div");
  newliteral.setAttribute("class", "personalsnips");
  arrayOfSnips.map((obj, index) => {
    console.log(index)
    console.log(obj)
  })
  // let holder = `
  //   <h1>${jsonObject.username}</h1>
  //   <div>
  //     <span>Games: ${jsonObject.games}</span><span>Wins: ${jsonObject.wins}</span><span>Losses: ${jsonObject.losses}</span>
  //   </div>
  //   <p>Avg Word Length: ${(jsonObject.wordlengths.reduce((a,b) => a+b, 0))/jsonObject.wordlengths.length}</p>
  //   <p>Avg Time: ${timecalc((jsonObject.times.reduce((a,b) => a+b, 0))/jsonObject.times.length)}</p>
  //   <h3>Game History:</h3>
  // `;
  // newliteral.innerHTML = holder;
  // profilepage.appendChild(newliteral);
}







});
