const storageKey = "BOOK_APPS";

const formAddingBook = document.getElementById("inputBook");
const formSearchingBook = document.getElementById("searchBook");
const appHeader = document.getElementById("appHeader");

// Reload the page when the header is clicked
appHeader.addEventListener("click", function() {
    location.reload(); 
});

// Check for local storage support
function CheckForStorage() {
    return typeof Storage !== "undefined";
}

// Handle form submission for adding or updating a book
formAddingBook.addEventListener("submit", function (event) {
    event.preventDefault(); 

    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = parseInt(document.getElementById("inputBookYear").value);
    const isComplete = document.getElementById("inputBookIsComplete").checked;

    const idTemp = document.getElementById("inputBookTitle").name; // Check if we're updating a book
    if (idTemp !== "") {
        const bookData = GetBookList();
        for (let index = 0; index < bookData.length; index++) {
            if (bookData[index].id == idTemp) {
                // Update the existing book
                bookData[index].title = title;
                bookData[index].author = author;
                bookData[index].year = year;
                bookData[index].isComplete = isComplete;
                break;
            }
        }
        localStorage.setItem(storageKey, JSON.stringify(bookData));
        ResetAllForm(); // Reset the form after updating
        RenderBookList(bookData);
        return;
    }

    // Create a new book
    const id = Date.now().toString();
    const newBook = {
        id: id,
        title: title,
        author: author,
        year: year,
        isComplete: isComplete,
    };

    PutBookList(newBook);
    const bookData = GetBookList();
    RenderBookList(bookData);
    ResetAllForm(); // Reset the form after adding a new book
});

// Function to add a new book to local storage
function PutBookList(data) {
    if (CheckForStorage()) {
        let bookData = GetBookList(); // Get existing books
        bookData.push(data); // Add the new book
        localStorage.setItem(storageKey, JSON.stringify(bookData)); // Save updated list
    }
}

// Function to render the list of books
function RenderBookList(bookData) {
    if (bookData === null) {
        return;
    }

    const containerIncomplete = document.getElementById("incompleteBookshelfList");
    const containerComplete = document.getElementById("completeBookshelfList");

    containerIncomplete.innerHTML = "";
    containerComplete.innerHTML = "";

    for (let book of bookData) {
        const id = book.id;
        const title = book.title;
        const author = book.author;
        const year = book.year;
        const isComplete = book.isComplete;

        // Create book item
        let bookItem = document.createElement("div");
        bookItem.setAttribute("data-bookid", id);
        bookItem.setAttribute("data-testid", "bookItem");

        bookItem.innerHTML = `
            <h3 data-testid="bookItemTitle">${title}</h3>
            <p data-testid="bookItemAuthor">Penulis: ${author}</p>
            <p data-testid="bookItemYear">Tahun: ${year}</p>
            <div>
                <button data-testid="bookItemIsCompleteButton">${isComplete ? "Selesai dibaca" : "Belum selesai"}</button>
                <button data-testid="bookItemDeleteButton">Hapus buku</button>
                <button data-testid="bookItemEditButton">Edit buku</button>
            </div>
        `;

        // Add event listeners for buttons
        const completeButton = bookItem.querySelector('[data-testid="bookItemIsCompleteButton"]');
        completeButton.addEventListener("click", function () {
            isCompleteBookHandler(bookItem);
            const bookData = GetBookList();
            RenderBookList(bookData);
        });

        const deleteButton = bookItem.querySelector('[data-testid="bookItemDeleteButton"]');
        deleteButton.addEventListener("click", function () {
            DeleteAnItem(bookItem);
            const bookData = GetBookList();
            RenderBookList(bookData);
        });

        const editButton = bookItem.querySelector('[data-testid="bookItemEditButton"]');
        editButton.addEventListener("click", function () {
            UpdateAnItem(bookItem);
        });

        // Append to the appropriate container
        if (isComplete === false) {
            containerIncomplete.append(bookItem);
        } else {
            containerComplete.append(bookItem);
        }
    }
}

// Function to handle completion status
function isCompleteBookHandler(itemElement) {
    const bookData = GetBookList();
    const bookId = itemElement.getAttribute("data-bookid");

    for (let index = 0; index < bookData.length; index++) {
        if (bookData[index].id == bookId) {
            bookData[index].isComplete = !bookData[index].isComplete; // Toggle completion status
            break;
        }
    }
    localStorage.setItem(storageKey, JSON.stringify(bookData)); // Update local storage
}

// Function to search for books
function SearchBookList(title) {
    const bookData = GetBookList();
    if (bookData.length === 0) {
        return [];
    }

    const bookList = [];
    for (let index = 0; index < bookData.length; index++) {
        const tempTitle = bookData[index].title.toLowerCase();
        const tempTitleTarget = title.toLowerCase();
        if (tempTitle.includes(tempTitleTarget)) {
            bookList.push(bookData[index]);
        }
    }
    return bookList;
}

// Function to get the list of books from local storage
function GetBookList() {
    if (CheckForStorage()) {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    }
    return [];
}

// Function to delete a book
function DeleteAnItem(itemElement) {
    const bookData = GetBookList();
    const bookId = itemElement.getAttribute("data-bookid");

    for (let index = 0; index < bookData.length; index++) {
        if (bookData[index].id == bookId) {
            bookData.splice(index, 1); // Remove the book from the array
            break;
        }
    }
    localStorage.setItem(storageKey, JSON.stringify(bookData)); // Update local storage
}

// Function to update a book
function UpdateAnItem(itemElement) {
    const bookData = GetBookList();
    const bookId = itemElement.getAttribute("data-bookid");

    for (let book of bookData) {
        if (book.id == bookId) {
            document.getElementById("inputBookTitle").value = book.title;
            document.getElementById("inputBookAuthor").value = book.author;
            document.getElementById("inputBookYear").value = book.year;
            document.getElementById("inputBookIsComplete").checked = book.isComplete;
            document.getElementById("inputBookTitle").name = bookId; // Store the ID for updating
            break;
        }
    }
}

// Handle search form submission
formSearchingBook.addEventListener("submit", function (event) {
    event.preventDefault();
    const title = document.getElementById("searchBookTitle").value;
    const bookData = GetBookList();
    const bookList = title ? SearchBookList(title) : bookData;
    RenderBookList(bookList);
});

// Reset all form fields
function ResetAllForm() {
    document.getElementById("inputBookTitle").value = "";
    document.getElementById("inputBookAuthor").value = "";
    document.getElementById("inputBookYear").value = "";
    document.getElementById("inputBookIsComplete").checked = false;
    document.getElementById("searchBookTitle").value = "";
    document.getElementById("inputBookTitle").name = ""; // Clear the name attribute for new entries
}

// Load books from local storage on page load
window.addEventListener("load", function () {
    if (CheckForStorage()) {
        const bookData = GetBookList();
        RenderBookList(bookData);
    } else {
        alert("Browser yang Anda gunakan tidak mendukung Web Storage");
    }
});
