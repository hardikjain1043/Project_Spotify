console.log("Soptify Yahh!! .. Tune hi banaya hai Bsdk !! ");

let songs = [];
const audio = new Audio();
let currentfolder = "";
let currentSongIndex = 0;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}


async function getsongs(folder) {
    // Remove any double slashes and ensure single slash
    currentfolder = folder.replace(/\/+/g, '/');
    if (!currentfolder.endsWith('/')) currentfolder += '/';

    console.log("getting songs from", currentfolder);

    try {
        const response = await fetch(`${currentfolder}songs.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const songData = await response.json();
        songs = songData;

        console.log("Songs loaded:", songs);

        if (songs.length === 0) {
            alert("No songs found in the specified folder!");
        } else {
            displaySongList();
        }
    } catch (error) {
        console.error("Error fetching songs:", error);
        alert("Failed to load songs. Please check the folder path or server.");
    }
}


function playSong(index) {
    if (index < 0 || index >= songs.length) {
        alert("Invalid song selected!");
        return;
    }

    // Clean up the path to ensure single slashes
    const track = `${currentfolder}${songs[index].url}`.replace(/\/+/g, '/');
    console.log("Track to play:", track);

    audio.src = track;
    audio.play()
        .then(() => {
            console.log("Playback started:", track);
            currentSongIndex = index;
            play.src = "img/plaed.svg";
            updateUI(index);
        })
        .catch(error => {
            console.error("Error playing track:", error);
            alert("Failed to play the song. Please try another track.");
        });
    // document.querySelector(".divleft").innerHTML = `
    //     <div class="carimg">
    //         <img src="musiclogo.svg" alt="">
    //     </div>
    //     <div class="wrap">${track.replace(`/${currentfolder}`, "")
    //                               .replaceAll("%20", " ")
    //                               .replace(/\.\w+$/, "")}</div>`;
    // document.querySelector(".finaltime").innerText = "00:00";
    // document.querySelector(".runningtime").innerText = "00:00";
};
function updateUI(index) {
    // Use the title from the song object
    const songName = songs[index].title;

    document.querySelector(".divleft").innerHTML = `
        <div class="carimg"><img src="img/musiclogo.svg" alt="Music Logo"></div>
        <div class="wrap">${songName}</div>
    `;

    // Reset time and progress bar
    document.querySelector(".finaltime").innerText = "00:00";
    document.querySelector(".runningtime").innerText = "00:00";
    document.querySelector(".circle").style.left = "0%";
}

async function getalbumlist() {
    try {
        const response = await fetch("songs/albumlist.json");
        const albumlist = await response.json();
        console.log("Albums loaded:", albumlist);
        return albumlist;
    } catch (error) {
        console.error("Error fetching album list:", error);
        return ["1", "2", "ncs", "Gymsongs", "phonk"];
    }
}

async function displayAlbum() {
    console.log("Fetching albums...");
    const albums = await getalbumlist();
    const cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = "";

    for (const folder of albums) {
        try {
            console.log(`Processing album: ${folder}`);

            // Clean up paths to ensure single slashes
            const folderPath = `songs/${folder}`.replace(/\/+/g, '/');
            const metadataResponse = await fetch(`${folderPath}/info.json`);
            const metadata = await metadataResponse.json();

            const songsResponse = await fetch(`${folderPath}/songs.json`);
            const songs = await songsResponse.json();

            cardContainer.innerHTML += `
                <div class="card flex align-center justify-content rnd" data-folder="${folder}">
                    <img class="rnd"
                        src="${folderPath}/cover.png"
                        alt="${metadata.title}"
                        onerror="this.src='img/musiclogo.svg'">
                    <div class="play">
                        <svg fill="#000000" height="27px" width="27px" viewBox="0 0 512 512">
                            <circle cx="256" cy="256" r="256" fill="green"></circle>
                            <polygon points="189.776,141.328 189.776,370.992 388.672,256.16" fill="#000000"></polygon>
                        </svg>
                    </div>
                    <div class="caption">
                        <h2>${metadata.title}</h2>
                        <p>${metadata.discription || ''}</p>
                        <small>${songs.length} songs</small>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(`Error loading album ${folder}:`, error);
        }
    }

    // Add click event listeners to cards
    Array.from(document.getElementsByClassName("card")).forEach((card) => {
        card.addEventListener("click", async (event) => {
            const folder = event.currentTarget.dataset.folder;
            console.log("Loading songs from folder:", folder);

            // Clean up the path before fetching songs
            await getsongs(`songs/${folder}`.replace(/\/+/g, '/'));
            if (songs.length > 0) {
                playSong(0);
            }
        });
    });
}

function displaySongList() {
    const songListContainer = document.querySelector(".son_name").getElementsByTagName("ul")[0];
    songListContainer.innerHTML = ""; // Clear any existing content

    songs.forEach((song, index) => {
        // Use the title from the song object
        const songName = song.title;

        let songItem = document.createElement("li");
        songItem.classList.add("flex");
        songItem.innerHTML = `
            <img src="img/musiclogo.svg" alt="" class="invert musiclogo p-1">
            <div class="info">
                <div>${songName}</div>
            </div>
            <div class="playimgbut flex artist m-1">
                <img id ="sideplay" src="img/playingbutton.svg" class="invert play-song pauseside2" data-index="${index}" alt="">
                <span class="playnow flex align-center">play song</span>
            </div>`;

        // Add click listener to play the song
        songItem.querySelector(".play-song").addEventListener("click", () => {
            playSong(index);
        });

        songListContainer.appendChild(songItem);
    });
}
//display playing


async function main() {
    // console.log(getsongs("songs/p2"));

    await displayAlbum();


    audio.addEventListener("loadeddata", () => {
        console.log(audio.duration, audio.currentSrc, audio.currentTime);
    })

    // attach an eventlistner to each song
    Array.from(document.querySelector(".son_name").getElementsByTagName("li")).forEach((e, index) => {
        // console.log(e.target.);
        e.addEventListener("click", () => {
            currentSongIndex = index;
            audio.src = `${currentfolder}${e.querySelector(".info div").innerText}.mp3`;
            playSong(index);      
            document.getElementById("sideplay").src="img/plaed.svg" 
            play.src = "img/plaed.svg";
        });
    })

    //attach an event listner to music with buttons
    play.addEventListener("click", () => {
        if (!audio.src || audio.src.endsWith(`${currentfolder}undefined.mp3`)) {
            alert("Bhai Song pe to click krr , jo chalana hai");
        } else if (audio.paused) {
            audio.play();
            play.src = "img/plaed.svg";0
        } else {
            audio.pause();
            play.src = "img/playingbutton.svg";
        }
    }); 
    
    document.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            event.preventDefault();
            if (audio.paused) {
                audio.play();
                play.src = "img/plaed.svg";
            } else {
                audio.pause();
                play.src = "img/playingbutton.svg";
            }
        }
    });
    //time update function

    audio.addEventListener("timeupdate", () => {
        if (!isNaN(audio.duration)) {
            document.querySelector(".runningtime").innerText = formatTime(audio.currentTime);
            document.querySelector(".circle").style.transition = "left 0.1s linear";
            document.querySelector(".circle").style.left = (audio.currentTime / audio.duration) * 100 + "%";
            document.querySelector(".finaltime").innerText = formatTime(audio.duration);
        }
    });


    //bar-path

    //add an evenkt listner to seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekTime = (e.offsetX / e.target.getBoundingClientRect().width) * audio.duration;
        audio.currentTime = seekTime;
        document.querySelector(".circle").style.left = (audio.currentTime / audio.duration) * 100 + "%";
    })

    // humber connect

    document.querySelector(".humberg").addEventListener("click", () => {
        if (document.querySelector(".leftout").style.left === "-100%") {
            document.querySelector(".leftout").style.left = "0%";
            document.querySelector(".humberg").src = "img/cross.svg";
        }

        else {
            document.querySelector(".leftout").style.left = "-100%";
            document.querySelector(".humberg").src = "img/burger-menu-svgrepo-com.svg";
        }

    });
    // ad an next and previous button
    previous.addEventListener("click", () => {
        if (currentSongIndex > 0) {
            currentSongIndex--;
        } else {
            currentSongIndex = songs.length - 1;
        }
        playSong(currentSongIndex);
    });

    next.addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
        } else {
            currentSongIndex = 0;
        }
        playSong(currentSongIndex);
    });


    //with arrow
    document.addEventListener("keydown", (event) => {
        if (event.code === "ArrowLeft") {
            if (currentSongIndex > 0) {
                currentSongIndex--;
            } else {
                currentSongIndex = songs.length - 1;
            }
            playSong(currentSongIndex);
        } else if (event.code === "ArrowRight") {
            if (currentSongIndex < songs.length - 1) {
                currentSongIndex++;
            } else {
                currentSongIndex = 0;
            }
            playSong(currentSongIndex);
        }
    });



    //setup-ing speaker mute and unmute
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to ", e.target.value);
        audio.volume = e.target.value / 100;
        // document.querySelector(".range").getElementsByTagName("input")[0].value = e.target.value;
        // document.querySelector(".volume").src = e.target.value === "0" ? "img/mute.svg" : "img/speakimg.svg";
    })

    // volume mute and unmute

    document.querySelector(".volume").addEventListener("click", e => {
        console.log(e.target);
        if (e.target.src.includes("speakimg.svg")) {
            e.target.src = e.target.src.replace("speakimg.svg", "mute.svg")
            audio.volume = .0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "speakimg.svg")
            audio.volume = .1;
            //    document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })

    //setuping loop fuction
    let isloop = false;
    //autoplay
    audio.addEventListener("ended", () => {
        if (isloop) {
            audio.currentTime = 0;
            audio.play();
        } else {
            if (currentSongIndex < songs.length - 1) {
                currentSongIndex++;
                playSong(currentSongIndex);
            } else {
                audio.pause();
                play.src = "img/playingbutton.svg";
            }
        }
    });
    //loop for 1 song
    document.querySelector("#loop").addEventListener("click", () => {
        isloop = !isloop;
        if (isloop) {
            console.log("loop enabled");
            document.querySelector("#loop").src = "img/loopon.svg";
        } else {
            console.log("loop is off");
            document.querySelector("#loop").src = "img/loop.svg";
        }
    });


}
main();

