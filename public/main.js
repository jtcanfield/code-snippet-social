document.addEventListener("DOMContentLoaded", function() {
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
    var obj = JSON.parse(specificsnippets.textContent);
    specificsnippets.innerHTML = "";
    var newliteral = document.createElement("div");
    newliteral.setAttribute("class", "personalsnips");
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
    specificsnippets.appendChild(newliteral);
  }
});
