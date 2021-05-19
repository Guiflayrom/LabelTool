const inpFile = document.getElementById("inpFile");
const previewContainer = document.getElementById("uploadArea")
const previewImage = document.getElementById("image-preview")
const previewText = document.getElementById("uploadText")
const buttonConfirm = document.getElementById("submit")

//Tamanho real da imagem
let realSize = {width:null,height:null}

//Quando detectar mudança irá atualizar a tela e consequentemente colocar a imagem.
inpFile.addEventListener("change", function(){
    const file = this.files[0];

    if(file){
        const reader = new FileReader();
        previewText.style.display = "none";
        previewImage.style.display = "block";
        reader.addEventListener("load",function(){

            previewImage.setAttribute("src",this.result);
            buttonConfirm.setAttribute("href","label_tool/index.html")
            sessionStorage.setItem("imgData", reader.result);
        });
        
        reader.readAsDataURL(file);
        setTimeout(function(){
            realSizeW = previewImage.width
            realSizeH = previewImage.height

            sessionStorage.setItem("realSizeW", realSizeW);
            sessionStorage.setItem("realSizeH", realSizeH);

            previewImage.style.width = "100%"
        },100)

    } else {
        previewText.style.display = null;
        previewImage.style.display = null;
        previewImage.setAttribute("src","")
        realSize = {width:null,height:null}
        sessionStorage.clear()
        buttonConfirm.setAttribute("href","") 
    }
});