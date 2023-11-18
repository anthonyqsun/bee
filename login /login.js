function submitUsername() {
    if(localStorage.getItem("name")){
        alert(localStorage.getItem("name") + " is logged in");
        document.getElementById("username").value = "";
        document.getElementById("room").value = "";
        return;
    }
    let name = document.getElementById("username").value;
    console.log(name);
    document.getElementById("username").value = "";
    document.getElementById("room").value = "";

    localStorage.setItem("name", name);

}

function logout(){
    alert("logged out");
    localStorage.removeItem("name");
}




