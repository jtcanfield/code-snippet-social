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
    let holder = `
      <a href="/snippetview${obj._id}/"><h2>Title: ${obj.title}</h2></a>
      <h3>Notes: ${obj.notes}</h3>
      <h4>Snippet: ${obj.codesnippet}</h4>
      <h5>Language: ${obj.language}</h5>
      <h5>Created: ${obj.createdAt}</h5>
      <h5>Updated: ${obj.updatedAt}</h5>
      <h5>Tags: ${obj.tags}</h5>
    `;
    newliteral.innerHTML += holder;
  })
  profilepage.appendChild(newliteral);
}
//Single Snippet Page
var specificsnippets = document.getElementById("specificsnippets");
if (specificsnippets !== null){
  console.log(specificsnippets.textContent)
  var stringified = JSON.stringify(specificsnippets.textContent);
  var parsedsnippet = JSON.parse(stringified);
  console.log(parsedsnippet)
  specificsnippets.innerHTML = "";
  var newliteral = document.createElement("div");
  newliteral.setAttribute("class", "personalsnips");
  // arrayOfSnips.map((obj, index) => {
  //   let holder = `
  //     <a href="/snippetview${obj._id}/"><h2>Title: ${obj.title}</h2></a>
  //     <h3>Notes: ${obj.notes}</h3>
  //     <h4>Snippet: ${obj.codesnippet}</h4>
  //     <h5>Language: ${obj.language}</h5>
  //     <h5>Created: ${obj.createdAt}</h5>
  //     <h5>Updated: ${obj.updatedAt}</h5>
  //     <h5>Tags: ${obj.tags}</h5>
  //   `;
  //   newliteral.innerHTML += holder;
  // })
  // specificsnippets.appendChild(newliteral);
}







});
