// Accesing all required elements
const wrapper = document.querySelector('.wrapper');
const searchInput = wrapper.querySelector('input');
const searchBtn = wrapper.querySelector('#searchbtn');
const clearBtn = wrapper.querySelector('#clearbtn');
const infoText = wrapper.querySelector('.directions');
const wordList = wrapper.querySelector('#word-list');

// Event listeners for search and clear buttons, and Enter key
// search button
searchBtn.addEventListener('click', e => {
    e.preventDefault();
    const word = searchInput.value.trim();
    if (word) {
        fetchApi(word);
    }
});
// enter key
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        let word = searchInput.value.trim();
        if (word) {
            fetchApi(word);
        }
    }
});
// clear button
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    wordList.innerHTML = '';
    infoText.innerHTML = 'Type a word and press search to find its <span>meaning</span> and <span>synonyms</span>.';
    wrapper.classList.remove('active');
    localStorage.removeItem('wordlyLastResult');
    localStorage.removeItem('wordlyLastQuery');
});

// Function to fetch data from the dictionary API
async function fetchApi(word) {
    infoText.style.color = '#000';
    infoText.innerHTML = `Searching the meaning of <span>"${word}"</span>`;
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    let result = await fetch(url).then(res => res.json());
    console.log(result);
    if (result.title) {
        infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
        wordList.innerHTML = '';
    } else {
        wrapper.classList.add('active');
        const entry = result[0];
        showOutput(entry);
        // Local storage to save the last searched word and its result. Prevents the need to refetch the same word on page reload.
        localStorage.setItem('wordlyLastResult', JSON.stringify(entry));
        localStorage.setItem('wordlyLastQuery', word);
    }
}

// Function to get the pronunciation audio URL from the API result
function getPronunciationAudio(result) {
    if (!result.phonetics) return '';
    const audioObj = result.phonetics.find(item => item.audio && item.audio.trim());
    return audioObj ? audioObj.audio : '';
}

// Function to display the output on the page
function showOutput(result) {
    infoText.innerHTML = '';
    wordList.innerHTML = '';

    // Extracts the first meaning and definition from the fetched result to display. Also handles synonyms and pronunciation audio.
    const meaning = result.meanings[0];
    const def = meaning.definitions[0];
    const audioUrl = getPronunciationAudio(result);

    const synonyms = def.synonyms.length
        ? def.synonyms.slice(0, 5).join(', ')
        : meaning.synonyms.slice(0, 5).join(', ') || '—';

    // Inside the HTML.
    wordList.innerHTML = `
        <li id="word">
        <div class="details">
            <p>${result.word}</p>
            <span>${meaning.partOfSpeech} / ${result.phonetic || ''}</span>
            ${audioUrl ? `<span class="material-symbols-outlined volume-icon" data-audio="${audioUrl}" title="Play pronunciation">vol</span>` : ''}
        </div>
        </li>
        <li id="meaning">
        <div class="details">
            <p>Meaning</p>
            <span>${def.definition}</span>
        </div>
        </li>
        <li id="example">
        <div class="details">
            <p>Example</p>
            <span>${def.example || '—'}</span>
        </div>
        </li>
        <li id="synonyms">
        <div class="details">
            <p>Synonyms</p>
            <span>${synonyms}</span>
        </div>
        </li>
    `;
    // Event listener for the audio button to play pronunciation when clicked. 
    const audioButton = wordList.querySelector('.volume-icon');
    if (audioButton) {
        audioButton.addEventListener('click', () => {
            const audioSrc = audioButton.dataset.audio;
            if (!audioSrc) return;
            const audio = new Audio(audioSrc);
            audio.play().catch(error => console.error('Audio playback failed:', error));
        });
    }
}
// Function to load the last searched word and its result from local storage when the page is loaded. 
function loadLastSearch() {
    const savedResult = localStorage.getItem('wordlyLastResult');
    if (!savedResult) return;

    try {
        const result = JSON.parse(savedResult);
        const query = localStorage.getItem('wordlyLastQuery') || result.word;
        if (result && result.word) {
            searchInput.value = query;
            wrapper.classList.add('active');
            showOutput(result);
        }
    } catch (error) {
        console.error('Could not restore saved word:', error);
        localStorage.removeItem('wordlyLastResult');
        localStorage.removeItem('wordlyLastQuery');
    }
}

loadLastSearch();



    

