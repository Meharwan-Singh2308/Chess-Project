const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;


const pieceImages = {
    black:{
        p: "images/ChessIcons/black/pawn.png",
        n: "images/ChessIcons/black/knight.png",
        b: "images/ChessIcons/black/bishop.png",
        r: "images/ChessIcons/black/rook.png",
        q: "images/ChessIcons/black/queen.png",
        k: "images/ChessIcons/black/king.png"
    },
    white:{
        p: "images/ChessIcons/white/pawn.png",
        n: "images/ChessIcons/white/knight.png",
        b: "images/ChessIcons/white/bishop.png",
        r: "images/ChessIcons/white/rook.png",
        q: "images/ChessIcons/white/queen.png",
        k: "images/ChessIcons/white/king.png",
    },

   
  
};

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
        const squareElement = document.createElement("div")

        squareElement.classList.add("square", (rowIndex + squareIndex) % 2 == 0 ? "light" : "dark" )
    
        squareElement.dataset.row = rowIndex
        squareElement.dataset.col = squareIndex
    
        if(square){
            console.log(square.type);
            const pieceElement = document.createElement("div")
    
            pieceElement.classList.add("piece","relative", square.color == "w" ? "white" : "black")
    
            const pieceImg = document.createElement("img"); 

            pieceImg.setAttribute("src", square.color === "w" ? pieceImages.white[square.type] : pieceImages.black[square.type])

            pieceImg.alt = `${square.color} ${square.type}`;

            pieceImg.draggable = playerRole === square.color;
            pieceElement.draggable = playerRole === square.color;

            pieceElement.appendChild(pieceImg);

            pieceElement.addEventListener("dragstart",(e) => {
                if(pieceElement.draggable){
                    draggedPiece = pieceElement;
                    sourceSquare = {row: rowIndex , col: squareIndex}

                    e.dataTransfer.setData("text/plain","")
                }
            })

            pieceElement.addEventListener("dragend",(e) => {
                draggedPiece = null;
                sourceSquare = null;
            })
    
            squareElement.appendChild(pieceElement);
        }
    
        squareElement.addEventListener("dragover",(e) => {
            e.preventDefault();
        })

        squareElement.addEventListener("drop",(e) => {
            e.preventDefault();

            if(draggedPiece){
                const targetSquare = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col)
                }
                handleMove(sourceSquare,targetSquare);
            }

        })

        boardElement.appendChild(squareElement);
    });
   



});

    if(playerRole === "b"){
        boardElement.classList.add("flipped")
    }else{
        boardElement.classList.remove("flipped")
        
    }

};

const handleMove = (source , target) => {
    const move = {
        from: `${String.fromCharCode(97+ source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97+ target.col)}${8 - target.row}`,
        promotion: "q"
    }

    socket.emit("move",move)
};
    

socket.on("playerRole", function(role){
    playerRole = role;
    renderBoard()
})

socket.on("spectatorRole", function(){
    playerRole = null;
    renderBoard()
})

socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard()
})


socket.on("move",function(move){
    chess.move(move);
    renderBoard()
})


renderBoard();
