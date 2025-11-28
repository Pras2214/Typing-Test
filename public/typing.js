const words =
  "He decided to abandon his old car in the deserted alley The bird flew high above the treetops It seemed absurd to him that such a thing could happen She couldnt accept the fact that he was gone The car crash was just an accident nobody was hurt Please provide your bank account details for the transaction It took years of hard work to achieve his dream of becoming a doctor The bridge stretched across the wide river He acted quickly to save the drowning child Taking action is better than just talking about it Hes an active participant in community events The actor delivered a powerful performance in the play This is the actual price of the item no hidden fees He had to admit that he was wrong They decided to adopt a rescue dog from the local shelter The whole situation left him feeling alone and confused The plan was to climb the mountain by sunrise She could hear the alarm clock ringing from the other room He flipped through the photo album reminiscing about old times The party was a great success everyone had a good time He couldnt resist the allure of the mysterious stranger The cats eyes gleamed in the darkness of the night They went for a walk along the sandy beach at sunset"
    .toLowerCase()
    .split(" ");

const wordCount = words.length;

const gameTime = 10;
window.timer = null;
window.gameStart = null;

function addClass(ele, name) {
  ele.className += " " + name;
}

function removeClass(ele, name) {
  ele.className = ele.className.replace(name, "");
}

function randomWord() {
  const randomIndex = Math.ceil(Math.random() * wordCount);
  return words[randomIndex - 1];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`;
}

function newGame() {
  document.getElementById("words").innerHTML = "";
  for (let i = 0; i < 200; i++) {
    document.getElementById("words").innerHTML += formatWord(randomWord());
  }
  addClass(document.querySelector(".word"), "current");
  addClass(document.querySelector(".letter"), "current");
  document.getElementById("info").innerHTML = gameTime + "";
  window.timer = null;
}

function getWpm() {
  const words = [...document.querySelectorAll(".word")];
  const lastTypedWord = document.querySelector(".word.current");
  const lastTypedWordIndex = words.indexOf(lastTypedWord);
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = [];
  typedWords.forEach((word) => {
    const letters = [...word.children];
    const incorrectLetters = [];
    const correctLetters = [];
    letters.forEach((letter) => {
      if (letter.classList.contains("incorrect")) {
        incorrectLetters.push(letter);
      }
    });
    letters.forEach((letter) => {
      if (letter.classList.contains("correct")) {
        correctLetters.push(letter);
      }
    });

    if (
      incorrectLetters.length === 0 &&
      correctLetters.length === letters.length
    ) {
      correctWords.push(word);
    }
  });

  return ((correctWords.length / gameTime) * 60).toFixed(2);
}

function gameOver() {
  clearInterval(window.timer);
  addClass(document.getElementById("game"), "over");
  document.getElementById("info").innerHTML = `WPM: ${getWpm()}`;
  document.getElementById("cursor").style.display = "none";
}

// document.getElementById("newGameBtn").onclick = () => {
//   gameOver();
//   removeClass(document.getElementById("game"), "over");
//   newGame();
// };

document.getElementById("newGameBtn").onclick = () => {
  if (!document.querySelector("#game.over")) {
    gameOver();
    removeClass(document.getElementById("game"), "over");
    newGame();
  } else {
    location.reload();
  }
};

document.getElementById("game").addEventListener("keyup", (e) => {
  const key = e.key;
  const currentWord = document.querySelector(".word.current");
  const currentLetter = document.querySelector(".letter.current");
  const expected = currentLetter?.innerHTML || " ";
  const isLetter = key.length === 1 && key !== " ";
  const isSpace = key === " ";
  const isBackspace = key === "Backspace";
  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector("#game.over")) {
    return;
  }

  if (!window.timer && isLetter) {
    window.timer = setInterval(() => {
      if (!window.gameStart) {
        window.gameStart = new Date().getTime();
      }
      const currentTime = new Date().getTime();
      const sPassed = Math.round((currentTime - window.gameStart) / 1000);
      const sLeft = gameTime - sPassed;
      if (sLeft <= 0) {
        gameOver();
        return;
      }
      document.getElementById("info").innerHTML = sLeft + "";
    }, 1000);
  }

  //Checking if the pressed letter is corrent and if it is correct adding the correct class else the incorrect class
  if (isLetter) {
    document.getElementById("cursor").style.display = "block";
    if (currentLetter) {
      addClass(currentLetter, key === expected ? "correct" : "incorrect");
      removeClass(currentLetter, "current");
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, "current");
      }
    } else {
      const incorrectLetter = document.createElement("span");
      incorrectLetter.innerHTML = key;
      incorrectLetter.className = "letter incorrect extra";
      currentWord.appendChild(incorrectLetter);
    }
  }

  //If the user hits space when it is not expected
  if (isSpace) {
    if (expected !== " ") {
      const lettersToInvalidate = [
        ...document.querySelectorAll(".word.current .letter:not(.correct)"),
      ];
      lettersToInvalidate.forEach((letter) => {
        addClass(letter, "incorrect");
      });
    }
    removeClass(currentWord, "current");
    addClass(currentWord.nextSibling, "current");
    if (currentLetter) {
      removeClass(currentLetter, "current");
    }
    addClass(currentWord.nextSibling.firstChild, "current");
  }

  if (isBackspace) {
    if (currentLetter && isFirstLetter) {
      //make previous word current, last letter current
      removeClass(currentWord, "current");
      addClass(currentWord.previousSibling, "current");
      removeClass(currentLetter, "current");
      addClass(currentWord.previousSibling.lastChild, "current");
      removeClass(currentWord.previousSibling.lastChild, "correct");
      removeClass(currentWord.previousSibling.lastChild, "incorrect");
    }

    if (currentLetter && !isFirstLetter) {
      //move back one space and invalidate letter
      removeClass(currentLetter, "current");
      addClass(currentLetter.previousSibling, "current");
      removeClass(currentLetter.previousSibling, "correct");
      removeClass(currentLetter.previousSibling, "incorrect");
    }

    if (!currentLetter) {
      addClass(currentWord.lastChild, "current");
      removeClass(currentWord.lastChild, "correct");
      removeClass(currentWord.lastChild, "incorrect");
      const lastLetter = currentWord.lastChild;
      if (lastLetter.className.includes("extra")) {
        lastLetter.remove();
      }
    }
  }

  //move lines/words(scrolling)
  if (currentWord.getBoundingClientRect().top > 250) {
    const words = document.getElementById("words");
    const margin = parseInt(words.style.marginTop || "0px");
    words.style.marginTop = margin - 35 + "px";
  }

  //move the cursor
  const nextLetter = document.querySelector(".letter.current");
  const nextWord = document.querySelector(".word.current");
  const cursor = document.getElementById("cursor");
  cursor.style.top =
    (nextLetter || nextWord).getBoundingClientRect().top + 2 + "px";
  cursor.style.left =
    (nextLetter || nextWord).getBoundingClientRect()[
      nextLetter ? "left" : "right"
    ] + "px";
});

newGame();
