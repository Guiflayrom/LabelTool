// elemento canvas do HTML
let canvas; 

// contexto 2d extraido do canvas
let ctx;

//Variavel que salva a imagem
let savedImageData;

// Para verificar se o mouse está arrastando
let dragging = false; 

// Cor do que será desenhado (Não é constante)
let strokeColor = 'blue'; 

// FillColor utilizado nos circulos
let fillColor = strokeColor; 

// Grossura da Linha
let line_Width = 1000 

// Ferramenta atual selecionada
let currentTool = 'none'; 

// dimensões da tela
let canvasWidth = 1280; 
let canvasHeight = 720;

let ob = undefined

// Isso server para ver a primeira vez que é clicada na tela, para assim,
// Salvar a posição do primeiro circulo, pois na hora de fechar o poligno ele
// Deve clicar ai
let firsttime = true
let firstcircle = {
    x: null,
    y: null
}

//Salva todos os circulos de uma determinada forma como array
let Circles = [];

//Salva todos os arrays de circulos (Matrix)
let MCircles = [];

//Objeto atual selecionado, no caso, sempre será circulos
let actualObject;

//Objetos desenhados
let drawedObjects = []

//Matrizes dos polignos, a diferença é que "Poly" contém coordenadas dinamicas com a da imagem,
//Já a "PL" salva as coordenadas brutas
let PLdrawedObjects = []
let Poly = []

//Matriz de polignos
let polygonsMatrix = []

//Imagens desenhadas
let drawedImages = []

//vetor de coordenadas, costumam ser resetados após adicionar a matriz
let verticeVector = []

//Nome do poligno
let polyName

//Lista dos nomes de polignos
let listLabelNames = []

// Variavel utilizada para lógica de nomes
let assistListLabel = []

//Tamanho do Raio do circulo
let radius = 15

//Cores a serem utilizadas
let Colors = {
    "purple":"#6900A8",
    "yellow":"#E5DB00",
    "pink":"#E500DC",
    "light_green":"#00E598",
    "light_blue":"#00DEE5",
    "gray":"#CBCDD7",
    "red":"#D3171E",
    "green":"#17D326",
    "orange":"#FFA34C"
}

//Listas de nomes das cores disponiveis (Caso o usuario utilize todas as cores, essa lista irá dobrar de tamanho com os mesmos valores)
let colorName = ["purple","yellow","pink","light_green","light_blue","gray","red","green","orange"]

//Varivael utilizada em lógica para definir cores
let nameANDcolor = {}

//Variavel utilizada em lógica "Depois de editar" a posição de um poligno (criada para contornar bugs)
let afterEdit = false

//Classe circulo
class Circle {
    constructor(xpoint,ypoint,radius,color){
        this.xpoint = xpoint,
        this.ypoint = ypoint,
        this.radius = radius,
        this.color = color
    }
    draw(context){
        context.arc(this.xpoint,this.ypoint,this.radius,0,Math.PI * 2, false)
        context.fillStyle = this.color;
        context.fill();
        context.stroke()
    }
}

// Mantém a posição x e y onde clicado
class MouseDownPos{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}
 
// Detém x e y localização do mouse
class Location{
    constructor(x,y) {
        this.x = x,
        this.y = y;
    }
}
 
// Holds x & y position where clicked (Costuma ser estatico)
let mousedown = new MouseDownPos(0,0);

// Detém x e y localização do mouse (Costuma ser dinamica)
let loc = new Location(0,0);
 
// Chame nossa função para executar quando a página for carregada
document.addEventListener('DOMContentLoaded', setupCanvas);

//Detecta quando um circulo for clicado com base na posição dele e na onde foi realizado o click
function clickCircle(fc,xmouse,ymouse){
    const distance = Math.sqrt(
        ( (xmouse - fc.x) * (xmouse - fc.x))
        +
        ( (ymouse - fc.y) * (ymouse - fc.y))
    );
    if(distance < radius){
        return true;
    }else{
        return false;
    }
}

//Muda de ferramenta para line
function Line(){
    if(currentTool == "line"){
        currentTool = "none"
    }else{
        currentTool = "line"
    }
}

//Desenha o background na tela
function drawImage(ctx){
    setTimeout(function(){
        var dataImage = sessionStorage.getItem('imgData'); //Recolhe a imagem armazenada na sessão do usuario (navegador)
        var imagePaper = new Image();

        imagePaper.onload = function(){
            ctx.drawImage(imagePaper,0,0,canvasWidth,canvasHeight);
        };
        imagePaper.src = dataImage;
    },10) 
}

//Função mestre, o código realmente começa daqui
function setupCanvas(){
    // Obtém referência ao elemento canvas
    canvas = document.getElementById('screen');
    // Obtém métodos para manipular a tela
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = line_Width;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    //Desenha o background
    drawImage(ctx)

    //Salva o background em "DrawedImges", ou seja, "drawedImages[0]" sempre será o background
    setTimeout(function(){
        drawedImages.push(SaveCanvasImage(true))
    },500)
  
    // Reage quando o mouse está clicado
    canvas.addEventListener("mousedown", ReactToMouseDown);
    // Reage quando o mouse está em movimento
    canvas.addEventListener("mousemove", ReactToMouseMove);
    // Reage quando se solta o botão do mouse
    canvas.addEventListener("mouseup", ReactToMouseUp);
}

// Pega a posição do Mouse com base na interface Web
function GetMousePosition(x,y){
    let canvasSizeData = canvas.getBoundingClientRect();
    return { x: (x - canvasSizeData.left) * (canvas.width  / canvasSizeData.width),
        y: (y - canvasSizeData.top)  * (canvas.height / canvasSizeData.height)
      };
}

//Função utilizada para salvar a imagem na variavel savedImageData
function SaveCanvasImage(returnImg){
    if(returnImg){
        return ctx.getImageData(0,0,canvas.width,canvas.height);
    }else{
        savedImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    }
}

//Redesenha o conteudo com base na savedImageData
function RedrawCanvasImage(toDraw){
    if(toDraw){
        ctx.putImageData(toDraw,0,0);
    }else{
        ctx.putImageData(savedImageData,0,0);
    }
}

//Função duplicada, faz o mesmo que a anterior porém deixa claro que está sempre sendo utilizada para colocar fundos
function PutBackgroundImage(backgroundSaved){
    ctx.putImageData(backgroundSaved,0,0);
}

//Detectar se o mouse em movimento está sobre o circulo
function isHoverCircle(fc,xmouse,ymouse,lis){
    let distance = 0
    if(lis){
        distance = Math.sqrt(
            ( (xmouse - lis[0]) * (xmouse - lis[0]))
            +
            ( (ymouse - lis[1]) * (ymouse - lis[1]))
        ); 
    }else{
        distance = Math.sqrt(
            ( (xmouse - fc.x) * (xmouse - fc.x))
            +
            ( (ymouse - fc.y) * (ymouse - fc.y))
        );
    }
    if(distance < radius){
        return true;
    }else{
        return false;
    }
}

// Muda a ferramenta atual para editar
function Edit(){
    if(currentTool == "edit"){
        currentTool = "none"
    }else{
        currentTool = "edit"
    }
}

// Essa função está sempre sendo utilizada quando o mouse está em movimento
function drawRubberbandShape(loc){ //Here is in moviment
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;

    if(currentTool === "line"){

        if(isHoverCircle(firstcircle,loc.x,loc.y)){
            canvas.style.cursor = "cell";
            ctx.beginPath();
            ctx.moveTo(mousedown.x, mousedown.y);
            ctx.lineTo(firstcircle.x, firstcircle.y);
            ctx.stroke();
            ctx.closePath();
        }else{
            ctx.beginPath();
            ctx.moveTo(mousedown.x, mousedown.y);
            ctx.lineTo(loc.x, loc.y);
            ctx.stroke();
            ctx.closePath();
        }
        
        var vertice = new Circle(mousedown.x, mousedown.y,radius,strokeColor)
        vertice.draw(ctx)
    }
}

//Da um Update
function UpdateRubberbandOnMove(loc){
    drawRubberbandShape(loc);
}

//Converte os valores do clique de valor bruto para o clique dinâmico
function ConvertSize(CordX,CordY){
    let realSizeW = sessionStorage.getItem("realSizeW");realSizeW = parseInt(realSizeW)
    let realSizeH = sessionStorage.getItem("realSizeH");realSizeH = parseInt(realSizeH)
    let X = CordX;
    let Y = CordY;

    if(!(realSizeW == canvasWidth)){
        let reX = CordX * realSizeW
        X = reX / canvasWidth    
    }
    if(!(realSizeH == canvasHeight)){
        let reY = CordY * realSizeH
        Y = reY / canvasHeight
    }

    X = Math.trunc(X)
    Y = Math.trunc(Y)

    if(X <= 0){X = 0}
    if(Y <= 0){Y = 0}

    return [X,Y]



    /*
    regra de 3 que está sendo utilizada:

        canvasWidth - CordX
        realSizeW - X

        canvasHeight - CordY
        realSizeW - Y
    */
}

//Normaliza coordenadas
function NormalizePoints(array){
    // considerando que o array = [[176,545],[445,484],[884,584],[445,484]]
    let rt = {}
    let size = array.length
    array.forEach(function(point,i){
        if(i+1 != size){
            rt[i] = [array[i],array[i+1]]
        }else{
            rt[i] = [array[i],array[0]]
        }
    })
    return rt;
}

//Atualiza a tela com base nas coordenadas normalizadas que estão em matrizes
function UpdateEdit(){ // PLdrawedObjects[0].LabelVertices[0] Here is in moviment
    afterEdit = true
    PutBackgroundImage(drawedImages[0])
    PLdrawedObjects.forEach(function(obj,i){
        let qtdPoly = obj.LabelVertices.length
        var points = NormalizePoints(obj.LabelVertices)
        for(var i = 0; i < qtdPoly; i++){
            let x = obj.LabelVertices[i][0]
            let y = obj.LabelVertices[i][1]
            strokeColor = Colors[obj.Color]
            var vertice = new Circle(x, y,radius,strokeColor)
            ctx.strokeStyle = strokeColor;
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.moveTo(points[i][0][0], points[i][0][1]);
            ctx.lineTo(points[i][1][0],points[i][1][1]);
            ctx.stroke();
            ctx.closePath();
            vertice.draw(ctx)
            strokeColor = "blue"
        }
    })
}

//Reage quando o mouse é clicado
function ReactToMouseDown(e){  // Here is static
    // Store location 
    loc = GetMousePosition(e.clientX, e.clientY);
    // Store mouse position when clicked
    if(currentTool == "line"){
        if(!(e.button == 2)){
            afterEdit = false
            mousedown.x = loc.x;
            mousedown.y = loc.y;
            // Save the current canvas image
            SaveCanvasImage(false);
            // Store that yes the mouse is being held down
            dragging = true;
           
            if(firsttime){
                firsttime = false;
                firstcircle.x = mousedown.x    
                firstcircle.y = mousedown.y

                drawedObjects.push([mousedown.x,mousedown.y])
                verticeVector.push(ConvertSize(mousedown.x,mousedown.y))
                let C = new Circle(mousedown.x, mousedown.y,radius,strokeColor)
                Circles.push(C)
                console.log("Vertices: ",ConvertSize(mousedown.x,mousedown.y))

            }else{
                if(clickCircle(firstcircle,mousedown.x,mousedown.y)){
                    ClosePolygon(e)
                }else{
                    drawedObjects.push([mousedown.x,mousedown.y])
                    verticeVector.push(ConvertSize(mousedown.x,mousedown.y))
                    let C = new Circle(mousedown.x, mousedown.y,radius,strokeColor)
                    Circles.push(C)
                    
                    console.log("Vertices: ",ConvertSize(mousedown.x,mousedown.y))
                }
            }
        }
    }
    if(currentTool == "edit"){
        dragging = true;
        SaveCanvasImage(false);
        canvas.style.cursor = "grabbing";
        MCircles.forEach(function(item,i){
            let CircleLenght = item[0].length;
            for(var i = 0; i < CircleLenght; i++){
                let circle = item[0][i]
                let fc = {x:circle.xpoint,y:circle.ypoint}
                if(clickCircle(fc,loc.x,loc.y)){
                    actualObject = [circle,item[1]]
                }
            }
        })
    }
}

//Reage quando o mouse está em movimento
function ReactToMouseMove(e){
    if(currentTool == "none"){canvas.style.cursor = "default";}
    if(currentTool == "edit"){
        canvas.style.cursor = "grab";
        PutBackgroundImage(drawedImages[0])
        if(actualObject != null){
            canvas.style.cursor = "grabbing";
            PLdrawedObjects.forEach(function(obj,index){
                if(obj.Id == actualObject[1]){
                    let points = obj.LabelVertices
                    let oc;
                    points.forEach(function(obj2,index2){
                        if(isHoverCircle(0,actualObject[0].xpoint,actualObject[0].ypoint,obj2)){
                            if(ob == undefined){ob = obj2}
                            if(dragging){oc = ob}
                            oc[0] = loc.x
                            oc[1] = loc.y
                            actualObject[0].xpoint = loc.x
                            actualObject[0].ypoint = loc.y
                            Poly[index].LabelVertices[index2] = ConvertSize(loc.x,loc.y)
                        }
                    })
                }
            })
        }
        UpdateEdit()
    }
    loc = GetMousePosition(e.clientX, e.clientY); // isso daqui q fecha o poligno
    if(currentTool == "line"){
        canvas.style.cursor = "crosshair";
        
        if(dragging && afterEdit == false){
            RedrawCanvasImage();
            UpdateRubberbandOnMove(loc);
        }if(dragging && afterEdit){
            RedrawCanvasImage();
        }
    }
}

//Reage quando o botão do mouse é soltado
function ReactToMouseUp(e){
    if(currentTool == "edit"){
        canvas.style.cursor = "grab";
        actualObject = null
        ob = undefined
        loc = GetMousePosition(e.clientX, e.clientY);
        SaveCanvasImage(false);
    }
}

//Retorna o shape da matriz a ser utilizada
function shapeMatriz(id,name,vertices,color){
    if(color){
        return {"Id":id,"LabelName":name,"LabelVertices": vertices,"Color":color}
    }else{
        return {"Id":id,"LabelName":name,"LabelVertices": vertices}
    }
}

//Função Undo, remove polignos conforme em ordem de criação
function Undo(){
    if(drawedImages.length > 1){
        RedrawCanvasImage(drawedImages[drawedImages.length -2])
        let nameLiToRemove = Poly[Poly.length -1]

        assistListLabel.splice(assistListLabel.length-1,1)
        PLdrawedObjects.splice(PLdrawedObjects.length-1,1)
        drawedImages.splice(drawedImages.length -1,1)
        MCircles.splice(MCircles.length -1,1)
        Poly.splice(Poly.length-1,1)

        listLabelNames.forEach(function(name,i){
            if(!(assistListLabel.includes(name))){listLabelNames.splice(i,1)}
        })
        setTimeout(function(){
            let name = nameLiToRemove.LabelName + nameLiToRemove.Id
            document.getElementById(name).remove()
        },20)
        UpdateEdit()
    }
}

//Atualiza o valor do checkbox quando é verificado
function valueCheckbox(id){
    if(id[1].value == "true"){id[1].value = "false"}
    else if(id[1].value == "false"){id[1].value = "true"}
}

//Função de remover algum poligno fora de ordem de criação
function Trash(){
    let checkboxs = document.getElementsByTagName("li")
    let checkboxsList = Array.prototype.slice.call(checkboxs)
    if(checkboxsList.length == 1){
        Undo()
    }else{
        checkboxsList.forEach(function(checkbox,index){
            if(checkbox.children[0].value == "true"){
                let RID = checkbox.id
                let indexGlobal
                PLdrawedObjects.forEach(function(item,index){
                    if(item.LabelName + item.Id == RID){
                        PLdrawedObjects.splice(index,1)
                        indexGlobal = index
                    }
                })
                assistListLabel.splice(indexGlobal,1)
                if(indexGlobal == 0){
                    drawedImages.splice(indexGlobal+1,1)
                }else{
                    drawedImages.splice(indexGlobal,1)
                }
                MCircles.splice(indexGlobal,1)
                Poly.splice(indexGlobal,1)
                listLabelNames.forEach(function(name,i){
                    if(!(assistListLabel.includes(name))){listLabelNames.splice(i,1)}
                })
                checkbox.remove()
                setTimeout(function(){
                    PutBackgroundImage(drawedImages[0])
                    UpdateEdit()
                    SaveCanvasImage(false)
                },20)
            }
        })
    }
}

//Essa função fecha o poligno, é chamada quando "clickCircle" retorna True
function ClosePolygon(e){
    canvas.style.cursor = "cell";
    loc = GetMousePosition(e.clientX, e.clientY); // isso daqui q fecha o poligno

    dragging = false;
    firsttime = true
    
    polyName = window.prompt("Enter Object Label","Car")
    if (polyName == null || polyName == ""){
        if(drawedImages.length <= 1){PutBackgroundImage(drawedImages[0])}
        else{RedrawCanvasImage(drawedImages[drawedImages.length -1])}

        verticeVector = []
        Circles = []
        drawedObjects = []

    }else{
        assistListLabel.push(polyName)

        if(!(listLabelNames.includes(polyName))){listLabelNames.push(polyName)}
        
        nameANDcolor = {}

        listLabelNames.forEach(function (name,index){
            if(colorName[index] == undefined){
                colorName = colorName.concat(colorName)
                nameANDcolor[name] = colorName[index]
            }
            else{nameANDcolor[name] = colorName[index]}
        })
        
        let id = polygonsMatrix.length
        let RID = polyName + id

        PLdrawedObjects.push(shapeMatriz(polygonsMatrix.length,polyName,drawedObjects,nameANDcolor[polyName]))
        Poly.push(shapeMatriz(polygonsMatrix.length,polyName,verticeVector))
        

        polygonsMatrix[polygonsMatrix.length] = {"PolyNames":listLabelNames,"Labels":Poly}
        MCircles[MCircles.length] = [Circles,id]
    
        console.log(polygonsMatrix)

        verticeVector = []
        Circles = []
        drawedObjects = []

        const listLabel = document.getElementById("listLabel")
        const li = document.createElement('li');
        const inputCheckBox = document.createElement('input')
        
        li.setAttribute("id",RID)
        
        li.innerText = polyName + " "
        
        inputCheckBox.setAttribute("type","checkbox")
        inputCheckBox.setAttribute("name",polyName)
        inputCheckBox.setAttribute("value","false")
        inputCheckBox.setAttribute("id",RID)
        inputCheckBox.setAttribute("onclick",`valueCheckbox(${RID})`)
        inputCheckBox.checked = false

        li.appendChild(inputCheckBox)
        
        listLabel.appendChild(li)

        UpdateEdit()
        drawedImages.push(SaveCanvasImage(true))


    }
}

//Função para converter a matriz em json, retorna no terminal mas pode ser ajustada conforme a necessidade
function Save(){
    var jsonRet = JSON.stringify(polygonsMatrix[0])    
    console.log(jsonRet) 
}