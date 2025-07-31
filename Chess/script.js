const urlParams = new URLSearchParams(window.location.search);
const gameMode = urlParams.get("mode");
const isAIEnabled = gameMode === "ai";
const isLocalMode = gameMode === "local";

let whiteTime = 600; // 10 minutes
let blackTime = 600;
let whiteTimerInterval;
let blackTimerInterval;

console.log("Selected game mode:", gameMode); // ← this will show "ai" or "local"
const boardState = {
  // White major pieces (rank 8)
  "8A": { type: "rook", color: "white" },
  "8B": { type: "knight", color: "white" },
  "8C": { type: "bishop", color: "white" },
  "8D": { type: "king", color: "white" },
  "8E": { type: "queen", color: "white" },
  "8F": { type: "bishop", color: "white" },
  "8G": { type: "knight", color: "white" },
  "8H": { type: "rook", color: "white" },

  // White pawns (rank 7)
  "7A": { type: "pawn", color: "white" },
  "7B": { type: "pawn", color: "white" },
  "7C": { type: "pawn", color: "white" },
  "7D": { type: "pawn", color: "white" },
  "7E": { type: "pawn", color: "white" },
  "7F": { type: "pawn", color: "white" },
  "7G": { type: "pawn", color: "white" },
  "7H": { type: "pawn", color: "white" },

  // Black pawns (rank 2)
  "2A": { type: "pawn", color: "black" },
  "2B": { type: "pawn", color: "black" },
  "2C": { type: "pawn", color: "black" },
  "2D": { type: "pawn", color: "black" },
  "2E": { type: "pawn", color: "black" },
  "2F": { type: "pawn", color: "black" },
  "2G": { type: "pawn", color: "black" },
  "2H": { type: "pawn", color: "black" },

  // Black major pieces (rank 1)
  "1A": { type: "rook", color: "black" },
  "1B": { type: "knight", color: "black" },
  "1C": { type: "bishop", color: "black" },
  "1D": { type: "queen", color: "black" },
  "1E": { type: "king", color: "black" },
  "1F": { type: "bishop", color: "black" },
  "1G": { type: "knight", color: "black" },
  "1H": { type: "rook", color: "black" },
};

const moveHistory = {
  whiteKingMoved: false,
  whiteRookAMoved: false,
  whiteRookHMoved: false,
  blackKingMoved: false,
  blackRookAMoved: false,
  blackRookHMoved: false,
};

let lastMove = null;
let currentTurn = "white";

document.addEventListener("DOMContentLoaded", () => {
  // Track moves for special rules (castling, en passant)

  // Track last move for en passant

  let draggedPiece = null;
  let fromSquareId = null;

  const pieces = document.querySelectorAll("img[draggable='true']");
  pieces.forEach((piece) => {
    piece.addEventListener("dragstart", (e) => {
      draggedPiece = e.target;
      fromSquareId = e.target.parentElement.id;

      // 🧠 Fix: Get the moving piece from board state
      const movingPiece = boardState[fromSquareId];

      // 💡 Calculate valid moves
      const validMoves = getValidMoves(
        fromSquareId,
        movingPiece,
        boardState,
        moveHistory,
        lastMove
      );

      // ✨ Highlight them
      validMoves.forEach((id) => {
        const square = document.getElementById(id);
        if (square) square.classList.add("highlight");
      });

      e.dataTransfer.setData("text/plain", e.target.id);
      e.dataTransfer.setDragImage(
        e.target,
        e.target.width / 2,
        e.target.height / 2
      );

      setTimeout(() => {
        e.target.style.visibility = "hidden";
      }, 0);
    });

    piece.addEventListener("dragend", () => {
      if (draggedPiece) draggedPiece.style.visibility = "visible";
      draggedPiece = null;
      fromSquareId = null;
      document.querySelectorAll(".highlight").forEach((square) => {
        square.classList.remove("highlight");
      });
    });
  });

  const squares = document.querySelectorAll(".container > div");
  squares.forEach((square) => {
    square.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    square.addEventListener("drop", (e) => {
      e.preventDefault();

      if (!draggedPiece || !fromSquareId) return;

      const toSquare = e.currentTarget;
      const toSquareId = toSquare.id;

      if (toSquareId === fromSquareId) {
        draggedPiece.style.visibility = "visible";
        return;
      }

      const movingPiece = boardState[fromSquareId];
      if (!movingPiece) return;

      const targetPiece = boardState[toSquareId];
      if (targetPiece && targetPiece.color === movingPiece.color) {
        showGameMessage("You can't capture your own piece!");
        draggedPiece.style.visibility = "visible";

        // 🧼 Clear highlights
        document.querySelectorAll(".highlight").forEach((square) => {
          square.classList.remove("highlight");
        });

        draggedPiece = null;
        fromSquareId = null;
        return;
      }
      if (movingPiece.color !== currentTurn) {
        showGameMessage(`It's ${currentTurn}'s turn!`);
        draggedPiece.style.visibility = "visible";
        clearHighlights();
        return;
      }

      const validMoves = getValidMoves(
        fromSquareId,
        movingPiece,
        boardState,
        moveHistory,
        lastMove
      );

      if (!validMoves.includes(toSquareId)) {
        showGameMessage("Invalid move!");
        draggedPiece.style.visibility = "visible";
        clearHighlights();
        draggedPiece = null;
        fromSquareId = null;
        return;
      }

      // Special handling: Check if castling move
      if (movingPiece.type === "king") {
        const rank = movingPiece.color === "white" ? "8" : "1";

        // King-side castling
        if (toSquareId === rank + "G") {
          const rookFrom = rank + "H";
          const rookTo = rank + "F";
          const rook = document.getElementById(rookFrom).querySelector("img");
          if (rook) {
            document.getElementById(rookTo).appendChild(rook);
            boardState[rookTo] = boardState[rookFrom];
            delete boardState[rookFrom];
          }
          moveHistory[movingPiece.color + "RookHMoved"] = true;
        }

        // Queen-side castling
        if (toSquareId === rank + "C") {
          const rookFrom = rank + "A";
          const rookTo = rank + "D";
          const rook = document.getElementById(rookFrom).querySelector("img");
          if (rook) {
            document.getElementById(rookTo).appendChild(rook);
            boardState[rookTo] = boardState[rookFrom];
            delete boardState[rookFrom];
          }
          moveHistory[movingPiece.color + "RookAMoved"] = true;
        }

        // Mark king as moved
        moveHistory[movingPiece.color + "KingMoved"] = true;
      }

      // Special handling: Mark rook moved
      if (movingPiece.type === "rook") {
        if (fromSquareId === "8A") moveHistory.whiteRookAMoved = true;
        if (fromSquareId === "8H") moveHistory.whiteRookHMoved = true;
        if (fromSquareId === "1A") moveHistory.blackRookAMoved = true;
        if (fromSquareId === "1H") moveHistory.blackRookHMoved = true;
      }

      // Special handling: En passant capture
      if (
        movingPiece.type === "pawn" &&
        lastMove &&
        lastMove.piece.type === "pawn" &&
        Math.abs(
          parseInt(lastMove.from[0], 10) - parseInt(lastMove.to[0], 10)
        ) === 2
      ) {
        // En passant capture squares:
        const enPassantRow = movingPiece.color === "white" ? 3 : 6;
        if (
          toSquareId[0] === enPassantRow.toString() &&
          toSquareId[1] === lastMove.to[1] &&
          fromSquareId[0] === enPassantRow.toString()
        ) {
          // Remove the captured pawn
          const capturedPawnSquare = lastMove.to;
          const capturedPawnElem = document
            .getElementById(capturedPawnSquare)
            .querySelector("img");
          if (capturedPawnElem) capturedPawnElem.remove();
          delete boardState[capturedPawnSquare];
        }
      }

      // Capture any piece on the destination square
      const existingPiece = toSquare.querySelector("img");
      if (existingPiece) existingPiece.remove();

      // Move the piece's DOM element
      toSquare.appendChild(draggedPiece);
      draggedPiece.style.visibility = "visible";

      // Check if capturing a king
      if (
        boardState[toSquareId] &&
        boardState[toSquareId].type === "king" &&
        boardState[toSquareId].color !== movingPiece.color
      ) {
        delete boardState[toSquareId]; // Remove king from boardState
      }

      // Update board state
      boardState[toSquareId] = movingPiece;
      delete boardState[fromSquareId];
      // ✅ Check if opponent king is still on the board
      const opponentKingExists = Object.values(boardState).some(
        (piece) => piece.type === "king" && piece.color !== movingPiece.color
      );

      if (!opponentKingExists) {
        showGameMessage(
          `${movingPiece.color.toUpperCase()} wins! The king has been captured.`
        );

        // 🛑 Optional: Disable further piece movement
        document.querySelectorAll("img[draggable='true']").forEach((img) => {
          img.setAttribute("draggable", "false");
        });

        return; // 🚫 End turn logic here
      }

      // Update last move for en passant detection
      lastMove = {
        piece: movingPiece,
        from: fromSquareId,
        to: toSquareId,
      };

      // ✅ Check if move leaves own king in check
      if (isKingInCheck(movingPiece.color, boardState)) {
        // Revert board state
        delete boardState[toSquareId];
        boardState[fromSquareId] = movingPiece;

        // Revert DOM change
        const fromSquareElem = document.getElementById(fromSquareId);
        fromSquareElem.appendChild(draggedPiece);

        draggedPiece.style.visibility = "visible";
        showGameMessage("Move leaves king in check! Invalid.");

        draggedPiece = null;
        fromSquareId = null;
        clearHighlights();
        return;
      }

      // ✅ Handle pawn promotion
      if (movingPiece.type === "pawn") {
        const promotionRank = movingPiece.color === "white" ? "1" : "8";
        if (toSquareId[0] === promotionRank) {
          boardState[toSquareId] = { type: "queen", color: movingPiece.color };
          draggedPiece.src = `${movingPiece.color}_queen.png`;
        }
      }

      // ✅ Turn swaps now only after ALL checks have passed
      console.log(
        `Moved ${movingPiece.color} ${movingPiece.type} from ${fromSquareId} to ${toSquareId}`
      );
      console.log("Updated boardState:", boardState);

      // ✅ Check if opponent is in check before swapping
      const opponentColor = currentTurn === "white" ? "black" : "white";
      if (isKingInCheck(opponentColor, boardState)) {
        showGameMessage(
          `${
            opponentColor.charAt(0).toUpperCase() + opponentColor.slice(1)
          } is in check!`
        );
      }

      // ✅ Swap turn at the very end
      currentTurn = opponentColor;
      switchTimers(); // ⏱️ Start white timer right away
      updateTimersDisplay(); // ⏱️ Update timer display
      console.log("Current turn is now:", currentTurn);
      if (isLocalMode) {
        showGameMessage(`Your turn, ${currentTurn}!`);
      }

      if (isAIEnabled && currentTurn === "black") {
        setTimeout(() => {
          performAIMove("black");
        }, 500);
      }

      // ✅ Cleanup
      draggedPiece = null;
      fromSquareId = null;
      clearHighlights();
    });
  });
});

/**
 * Get valid moves for a piece including special rules
 * @param {string} squareId
 * @param {object} piece
 * @param {object} boardState
 * @param {object} moveHistory
 * @param {object|null} lastMove
 * @returns {string[]}
 *
 *
 */
const moveCache = new Map();
function getValidMoves(
  squareId,
  piece,
  boardState,
  moveHistory,
  lastMove,
  skipKingSafetyCheck = false
) {
  // Create cache key
  const cacheKey = `${squareId}_${piece.type}_${piece.color}_${JSON.stringify(
    boardState
  )}`;

  if (moveCache.has(cacheKey)) {
    return moveCache.get(cacheKey);
  }
  const fileLetters = "ABCDEFGH";
  const rank = parseInt(squareId[0], 10);
  const file = squareId[1];
  const validMoves = [];

  // Helper to check if position is inside board
  function isOnBoard(r, f) {
    return r >= 1 && r <= 8 && fileLetters.includes(f);
  }

  // Helper to get occupant
  function occupant(r, f) {
    return boardState[`${r}${f}`];
  }

  // Pawn moves
  if (piece.type === "pawn") {
    const direction = piece.color === "white" ? -1 : 1;
    const startRank = piece.color === "white" ? 7 : 2;

    // One step forward if empty
    if (!occupant(rank + direction, file)) {
      if (isOnBoard(rank + direction, file))
        validMoves.push(`${rank + direction}${file}`);

      // Two steps from start if both empty
      if (
        rank === startRank &&
        !occupant(rank + 2 * direction, file) &&
        !occupant(rank + direction, file)
      ) {
        validMoves.push(`${rank + 2 * direction}${file}`);
      }
    }

    // Capture diagonally
    const fileIndex = fileLetters.indexOf(file);
    const diagLeft = fileLetters[fileIndex - 1];
    const diagRight = fileLetters[fileIndex + 1];

    [diagLeft, diagRight].forEach((diagFile) => {
      if (diagFile) {
        const target = `${rank + direction}${diagFile}`;
        const occupantPiece = occupant(rank + direction, diagFile);
        // Normal capture
        if (occupantPiece && occupantPiece.color !== piece.color) {
          validMoves.push(target);
        }
        // En passant capture
        else if (
          lastMove &&
          lastMove.piece.type === "pawn" &&
          lastMove.piece.color !== piece.color &&
          lastMove.from[0] === (rank + 2 * -direction).toString() &&
          lastMove.to === `${rank}${diagFile}` &&
          squareId[0] === rank.toString()
        ) {
          validMoves.push(target);
        }
      }
    });
  }
  // Rook moves
  else if (piece.type === "rook") {
    // Rook moves any number of squares along ranks and files until blocked
    const directions = [
      [1, 0], // up
      [-1, 0], // down
      [0, 1], // right
      [0, -1], // left
    ];

    directions.forEach(([dr, df]) => {
      let r = rank + dr;
      let fIndex = fileLetters.indexOf(file) + df;

      while (isOnBoard(r, fileLetters[fIndex])) {
        const target = `${r}${fileLetters[fIndex]}`;
        const occupantPiece = occupant(r, fileLetters[fIndex]);
        if (!occupantPiece) {
          validMoves.push(target);
        } else {
          if (occupantPiece.color !== piece.color) validMoves.push(target);
          break;
        }
        r += dr;
        fIndex += df;
      }
    });
  }
  // Knight moves
  else if (piece.type === "knight") {
    const knightMoves = [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ];

    knightMoves.forEach(([dr, df]) => {
      const r = rank + dr;
      const fIndex = fileLetters.indexOf(file) + df;
      if (isOnBoard(r, fileLetters[fIndex])) {
        const occupantPiece = occupant(r, fileLetters[fIndex]);
        if (!occupantPiece || occupantPiece.color !== piece.color) {
          validMoves.push(`${r}${fileLetters[fIndex]}`);
        }
      }
    });
  }
  // Bishop moves
  else if (piece.type === "bishop") {
    const directions = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];

    directions.forEach(([dr, df]) => {
      let r = rank + dr;
      let fIndex = fileLetters.indexOf(file) + df;

      while (isOnBoard(r, fileLetters[fIndex])) {
        const target = `${r}${fileLetters[fIndex]}`;
        const occupantPiece = occupant(r, fileLetters[fIndex]);
        if (!occupantPiece) {
          validMoves.push(target);
        } else {
          if (occupantPiece.color !== piece.color) validMoves.push(target);
          break;
        }
        r += dr;
        fIndex += df;
      }
    });
  }
  // Queen moves (combines rook + bishop)
  else if (piece.type === "queen") {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];

    directions.forEach(([dr, df]) => {
      let r = rank + dr;
      let fIndex = fileLetters.indexOf(file) + df;

      while (isOnBoard(r, fileLetters[fIndex])) {
        const target = `${r}${fileLetters[fIndex]}`;
        const occupantPiece = occupant(r, fileLetters[fIndex]);
        if (!occupantPiece) {
          validMoves.push(target);
        } else {
          if (occupantPiece.color !== piece.color) validMoves.push(target);
          break;
        }
        r += dr;
        fIndex += df;
      }
    });
  }
  // King moves
  else if (piece.type === "king") {
    const kingMoves = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];

    kingMoves.forEach(([dr, df]) => {
      const r = rank + dr;
      const fIndex = fileLetters.indexOf(file) + df;
      const f = fileLetters[fIndex];

      if (isOnBoard(r, f)) {
        const targetSquare = `${r}${f}`;
        const occupantPiece = occupant(r, f);

        // Only allow if the square is empty or contains an opponent's piece
        if (!occupantPiece || occupantPiece.color !== piece.color) {
          // Protect against recursion: pass skipKingSafetyCheck=true from attack scan
          if (!skipKingSafetyCheck) {
            if (!isSquareUnderAttack(targetSquare, piece.color, boardState)) {
              validMoves.push(targetSquare);
            }
          } else {
            validMoves.push(targetSquare);
          }
        }
      }
    });

    // ♜ Castling Logic
    const colorPrefix = piece.color;
    const startRank = colorPrefix === "white" ? 8 : 1;

    const kingSquare = `${startRank}E`;
    const kingsideSquares = [`${startRank}F`, `${startRank}G`];
    const queensideSquares = [
      `${startRank}B`,
      `${startRank}C`,
      `${startRank}D`,
    ];

    // 🏰 King-side castling
    if (
      !moveHistory[colorPrefix + "KingMoved"] &&
      !moveHistory[colorPrefix + "RookHMoved"] &&
      kingsideSquares.every((sq) => !boardState[sq]) &&
      kingsideSquares
        .concat(kingSquare)
        .every((sq) => !isSquareUnderAttack(sq, colorPrefix, boardState))
    ) {
      validMoves.push(`${startRank}G`);
    }

    // 🏰 Queen-side castling
    if (
      !moveHistory[colorPrefix + "KingMoved"] &&
      !moveHistory[colorPrefix + "RookAMoved"] &&
      queensideSquares.every((sq) => !boardState[sq]) &&
      [kingSquare, `${startRank}D`, `${startRank}C`].every(
        (sq) => !isSquareUnderAttack(sq, colorPrefix, boardState)
      )
    ) {
      validMoves.push(`${startRank}C`);
    }
  }
  if (validMoves.length === 0) {
    console.log(
      `No valid moves found for ${piece.color} ${piece.type} at ${squareId}`
    );
  }
  // Store in cache before returning
  moveCache.set(cacheKey, validMoves);
  return validMoves;
}

/**
 * Checks if the given square is attacked by any opponent piece
 * @param {string} squareId
 * @param {string} ownColor
 * @param {object} boardState
 * @returns {boolean}
 */
function isSquareUnderAttack(squareId, ownColor, boardState) {
  const opponentColor = ownColor === "white" ? "black" : "white";
  console.log(
    `Checking if square ${squareId} is under attack by ${opponentColor}`
  );
  const fileLetters = "ABCDEFGH";
  const rank = parseInt(squareId[0], 10);
  const file = squareId[1];
  const originalBoard = JSON.parse(JSON.stringify(boardState));
  const tempBoard = JSON.parse(JSON.stringify(boardState));

  // Temporarily remove the king if checking for checks
  if (tempBoard[squareId]?.type === "king") {
    delete tempBoard[squareId];
  }

  // Scan all opponent pieces and check if they can move to squareId
  for (const [pos, piece] of Object.entries(boardState)) {
    if (piece.color !== opponentColor) continue;

    const moves = getValidMoves(pos, piece, boardState, {}, null, true);

    if (moves.includes(squareId)) return true;
  }

  return false;
}

/**
 * Checks if own king is in check
 * @param {string} color
 * @param {object} boardState
 * @returns {boolean}
 */
function isKingInCheck(color, boardState) {
  // Find king position
  let kingPos = null;
  for (const [pos, piece] of Object.entries(boardState)) {
    if (piece.color === color && piece.type === "king") {
      kingPos = pos;
      break;
    }
  }
  if (!kingPos) return false;

  return isSquareUnderAttack(kingPos, color, boardState);
}

function showGameMessage(text) {
  const msgBox = document.getElementById("gameMessage");
  if (!msgBox) return;

  msgBox.textContent = text;
  msgBox.classList.add("visible");

  setTimeout(() => {
    msgBox.classList.remove("visible");
  }, 5000); // Message visible for 5 seconds
}

function scoreMove(piece, toSquareId, boardState) {
  let score = 0;
  const targetPiece = boardState[toSquareId];
  if (targetPiece) {
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 100,
    };
    score += pieceValues[targetPiece.type] || 0;
  }

  if (["D4", "E4", "D5", "E5"].includes(toSquareId)) score += 1; // central squares

  // Add more rules as needed!
  return score;
}
function performAIMove(aiColor) {
  const startTime = Date.now();

  // Clear cache before new move calculation
  moveCache.clear();
  const aiPieces = Object.entries(boardState).filter(
    ([_, piece]) => piece.color === aiColor
  );

  let bestMove = null;
  let bestScore = -Infinity;

  // Evaluate all possible moves
  for (const [squareId, piece] of aiPieces) {
    const validMoves = getValidMoves(
      squareId,
      piece,
      boardState,
      moveHistory,
      lastMove
    );

    for (const targetSquare of validMoves) {
      // Simulate the move without affecting real board
      const simulatedBoard = JSON.parse(JSON.stringify(boardState));
      simulatedBoard[targetSquare] = simulatedBoard[squareId];
      delete simulatedBoard[squareId];

      // Score the move using multiple factors
      const score = evaluateBoard(simulatedBoard, aiColor);

      // If this move is better than previous best, update
      if (score > bestScore) {
        bestScore = score;
        bestMove = {
          from: squareId,
          to: targetSquare,
          piece,
        };
      }
    }
  }

  // If no moves found (shouldn't happen unless game is over)
  if (!bestMove) {
    showGameMessage("AI has no valid moves.");
    return;
  }

  // ========== YOUR ORIGINAL MOVE EXECUTION CODE BELOW ==========
  const fromSquareElem = document.getElementById(bestMove.from);
  const toSquareElem = document.getElementById(bestMove.to);
  const pieceImg = fromSquareElem.querySelector("img");

  if (!pieceImg) return;

  // Capture any piece on destination square
  toSquareElem.innerHTML = "";
  toSquareElem.appendChild(pieceImg);

  // Update board state
  boardState[bestMove.to] = boardState[bestMove.from];
  delete boardState[bestMove.from];

  // Update move history
  lastMove = {
    piece: bestMove.piece,
    from: bestMove.from,
    to: bestMove.to,
  };

  // Switch turn to player
  currentTurn = "white";
  clearHighlights();

  // Update draggable state to allow player to move
  document.querySelectorAll("img").forEach((img) => {
    const parent = img.parentElement;
    const squarePiece = boardState[parent?.id];
    if (squarePiece?.color === "white") {
      img.setAttribute("draggable", "true");
    } else {
      img.setAttribute("draggable", "false");
    }
  });

  showGameMessage("AI has moved. Your turn, white!");
  console.log(`AI thinking time: ${Date.now() - startTime}ms`);
}

// Simple evaluation function
function evaluateBoard(boardState, aiColor) {
  let score = 0;
  const pieceValues = {
    pawn: 10,
    knight: 30,
    bishop: 30,
    rook: 50,
    queen: 90,
    king: 900,
  };

  // 1. Material count
  for (const piece of Object.values(boardState)) {
    score +=
      piece.color === aiColor
        ? pieceValues[piece.type]
        : -pieceValues[piece.type];
  }

  // 2. Add bonuses for center control
  const centerSquares = ["D4", "E4", "D5", "E5"];
  for (const [pos, piece] of Object.entries(boardState)) {
    if (piece.color === aiColor && centerSquares.includes(pos)) {
      score += 5; // Bonus for controlling center
    }
  }

  // 3. Bonus for checking opponent
  const opponentColor = aiColor === "white" ? "black" : "white";
  if (isKingInCheck(opponentColor, boardState)) {
    score += 50; // Bonus for putting opponent in check
  }

  return score;
}

function findBestMove(boardState, aiColor, depth) {
  let bestMove = null;
  let bestScore = -Infinity;

  const aiPieces = Object.entries(boardState).filter(
    ([pos, piece]) => piece.color === aiColor
  );

  for (const [fromSquareId, piece] of aiPieces) {
    const validMoves = getValidMoves(
      fromSquareId,
      piece,
      boardState,
      moveHistory,
      lastMove
    );

    for (const toSquareId of validMoves) {
      const simulatedBoard = JSON.parse(JSON.stringify(boardState));
      simulatedBoard[toSquareId] = simulatedBoard[fromSquareId];
      delete simulatedBoard[fromSquareId];

      // Only evaluate as AI's turn (maximizing player)
      const score = minimax(
        simulatedBoard,
        depth - 1,
        false, // Next evaluation is for opponent (minimizing)
        -Infinity,
        Infinity,
        aiColor
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = { from: fromSquareId, to: toSquareId, piece };
      }
    }
  }

  return bestMove;
}

function clearHighlights() {
  document.querySelectorAll(".highlight").forEach((square) => {
    square.classList.remove("highlight");
  });
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

function updateTimersDisplay() {
  document.getElementById("whiteTimer").textContent = `White: ${formatTime(
    whiteTime
  )}`;
  document.getElementById("blackTimer").textContent = `Black: ${formatTime(
    blackTime
  )}`;
}

function switchTimers() {
  clearInterval(whiteTimerInterval);
  clearInterval(blackTimerInterval);

  if (currentTurn === "white") {
    whiteTimerInterval = setInterval(() => {
      whiteTime--;
      updateTimersDisplay();
      if (whiteTime <= 0) handleTimeOut("white");
    }, 1000);
  } else {
    blackTimerInterval = setInterval(() => {
      blackTime--;
      updateTimersDisplay();
      if (blackTime <= 0) handleTimeOut("black");
    }, 1000);
  }
}

function handleTimeOut(color) {
  clearInterval(whiteTimerInterval);
  clearInterval(blackTimerInterval);
  showGameMessage(
    `${color.charAt(0).toUpperCase() + color.slice(1)} ran out of time!`
  );
  // Optional: disable drag-drop or add Game Over logic here
}

function evaluateTactics(from, to, piece, board) {
  let score = scoreMove(piece, to, board);

  // Penalty if move leaves king in check
  const simulatedBoard = JSON.parse(JSON.stringify(board));
  simulatedBoard[to] = piece;
  delete simulatedBoard[from];

  if (isKingInCheck(piece.color, simulatedBoard)) {
    score -= 100; // Massive penalty
  }

  return score;
}

function minimax(boardState, depth, isMaximizingPlayer, alpha, beta, aiColor) {
  // Base case: Return evaluation if depth is 0 or game ends
  if (depth === 0 || isGameOver(boardState)) {
    return evaluateBoard(boardState, aiColor);
  }

  if (isMaximizingPlayer) {
    // AI's turn (maximize score)
    let maxEval = -Infinity;
    const aiPieces = Object.entries(boardState).filter(
      ([_, piece]) => piece.color === aiColor
    );

    for (const [fromSquareId, piece] of aiPieces) {
      const validMoves = getValidMoves(
        fromSquareId,
        piece,
        boardState,
        moveHistory,
        lastMove
      );

      for (const toSquareId of validMoves) {
        const simulatedBoard = JSON.parse(JSON.stringify(boardState));
        simulatedBoard[toSquareId] = simulatedBoard[fromSquareId];
        delete simulatedBoard[fromSquareId];

        const eval = minimax(
          simulatedBoard,
          depth - 1,
          false, // Opponent's turn next
          alpha,
          beta,
          aiColor
        );

        maxEval = Math.max(maxEval, eval);
        alpha = Math.max(alpha, eval);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return maxEval;
  } else {
    // Opponent's turn (minimize score)
    let minEval = Infinity;
    const opponentPieces = Object.entries(boardState).filter(
      ([_, piece]) => piece.color !== aiColor
    );

    for (const [fromSquareId, piece] of opponentPieces) {
      const validMoves = getValidMoves(
        fromSquareId,
        piece,
        boardState,
        moveHistory,
        lastMove
      );

      for (const toSquareId of validMoves) {
        const simulatedBoard = JSON.parse(JSON.stringify(boardState));
        simulatedBoard[toSquareId] = simulatedBoard[fromSquareId];
        delete simulatedBoard[fromSquareId];

        const eval = minimax(
          simulatedBoard,
          depth - 1,
          true, // AI's turn next
          alpha,
          beta,
          aiColor
        );

        minEval = Math.min(minEval, eval);
        beta = Math.min(beta, eval);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return minEval;
  }
}
