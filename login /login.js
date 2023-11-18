function submitUsername() {
    if(localStorage.getItem("name")){
        alert(localStorage.getItem("name") + " is logged in");
        document.getElementById("username").value = "";
        return;
    }
    let name = document.getElementById("username").value;
    console.log(name);
    document.getElementById("username").value = "";
    localStorage.setItem("name", name);
}