//catch HTML Elements
const fileElement = document.querySelector('#file-element');
const dropArea = document.querySelector('#drop-area');
let deleteButtons; //will be defined after the files are dropped

//catch and handle 'dragenter', 'dragover', 'dragleave', 'drop'
const dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];

//define an array to hold the list of file data
let filesData = []; // [ {'id','path','name','tag', 'uploaded'} ]

/* ----------------------------- events catcher ----------------------------- */

//first remove default browser behavior from each event
dragEvents.forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

//highlight the drop area when the user enters it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

//un highlight the drop area when the user leaves it
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unHighlight, false);
});

//upload the file when the user drops it
dropArea.addEventListener('drop', handleDrop, false);

//*catch the file input and upload the file
fileElement.addEventListener('change', async function (e) {
    const files = e.target.files;
    //loop through the files and get file content and push the content to filesData array
    for (let file of [...files]) {
        await getFileContent(file);
    }
    //render the files to the gallery and upload to server
    await uploadFiles(filesData);

    //register event listers for delete file buttons
    registerDeleteButtonsListener();
    //register event listers for update file buttons
    registerUpdateButtonsListener();
});

/* ----------------------------- events handlers ---------------------------- */

//*prevent default browser behavior for the events
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

//*catch dragged files and prepare them for upload
async function handleDrop(e) {
    const files = e.dataTransfer.files;
    //loop through the files and get file content and push the content to filesData array
    for (let file of [...files]) {
        await getFileContent(file);
    }
    //render the files to the gallery and upload to server
    await uploadFiles(filesData);

    //register event listers for delete file buttons
    registerDeleteButtonsListener();
    //re register the event lister for delete file buttons
    registerUpdateButtonsListener();
}

//*get file content and push it to filesData array
function getFileContent(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise(async (resolve, reject) => {
        reader.onloadend = await function () {
            //Add the file to the filesData array
            filesData.push({
                path: reader.result,
                name: file.name,
                size: file.size,
                tag: '',
            });
            resolve();
        };
    });
}

//*register event listers for delete file buttons when the files are rendered
function registerDeleteButtonsListener() {
    deleteButtons = document.querySelectorAll('.delete-image');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            //delete the file from the filesData array
            const fileId = event.target.dataset.id;
            //change button loading state to loading
            isLoading(button, true, 'Delete');
            //delete the file from the server and from the gallery
            deleteFile(fileId, filesData);
            //remove the deleted file from files Data array
            filesData = filesData.filter(file => {
                return file.id != fileId;
            });

            //change button loading state to Deleted
            isLoading(button, false, 'Delete');
            //re register the event lister for delete file buttons
            registerDeleteButtonsListener();
            //register event listers for update file buttons
            registerUpdateButtonsListener();
        });
    });
}

//*register event listers for update file buttons when the files are rendered
function registerUpdateButtonsListener() {
    const updateButtons = document.querySelectorAll('.update-image');
    updateButtons.forEach(button => {
        button.addEventListener('click', async function (event) {
            const fileId = event.target.dataset.id;
            const fileTag = event.target.parentElement.parentElement.querySelector('input[name="tag"]').value;
            //catch name input
            const fileName = event.target.parentElement.parentElement.querySelector('input[name="name"]').value;
            //update the file tag in the filesData array
            filesData = filesData.map(file => {
                if (file.id == fileId) {
                    file.tag = fileTag;
                    file.name = fileName;
                }
                return file;
            });

            //change button loading state to loading
            isLoading(button, true, 'Update');
            //update the file data in the server
            await updateFile(fileId, filesData);
            //change button loading state to done
            isLoading(button, false, 'Update');

            //re register the event lister for delete file buttons
            registerUpdateButtonsListener();
        });
    });
}

/* ----------------------------------- render.js ---------------------------------- */

/* ---------------------------- Catch Dom Elements --------------------------- */
// const dropArea = document.querySelector('#drop-area');
const gallery = document.querySelector('#gallery');
const allowedExtensions =
                /(\.PNG|\.GIF|\.JPEG|\.PDF|\.WEBP|\.TIFF|\.PSD|\.EPS|\.INDD|\.RAW|\.SVG|\.JPG|\.DOX|\.ODT|\.TEX|\.TXT|\.WPD|\.BMP|\.DOCX)$/i;
/* ----------------------------- rendering Items To the DOM ------------------------------ */
export function renderFile(fileData) {
    let displayImage = `<img src="${fileData.path}" className="img-fluid rounded-start" alt="...">`;
    const imageExtensions = /(\.PNG|\.GIF|\.JPEG|\.WEBP|\.TIFF|\.JPG|\.SVG)$/i;
            if (!allowedExtensions.exec(fileData.name) || !isValidFileSize(fileData)) {
                displayImage = fileData.name
                 const HTML = `
			<div class="card mb-3">
				<div class="row g-0">
					<div class="col-md-4">
					    ${displayImage}						
					</div>
					<div class="col-md-8">
						<div class="card-body">
							  <label for="html" id="${fileData.id}"> </label><br>
						</div>
						<div class="card-footer bg-body border-0 card-footer d-flex justify-content-between">
						</div>
					</div>
				</div>
			</div>
		`;
    gallery.innerHTML += HTML;
            }else {
                if(!imageExtensions.exec(fileData.name)){
                    displayImage = `<img src="/static/oscar/img/cms_icons/document.svg" className="img-fluid rounded-start" alt="...">`;
                }
                const HTML = `
			<div class="card mb-3">
				<div class="row g-0">
					<div class="col-md-4">
					    ${displayImage}						
					</div>
					<div class="col-md-8">
						<div class="card-body">
							  <label for="html" id="${fileData.id}"> </label><br>
							<input type="text" class="form-control form-group mb-3" placeholder="Title" name="name" value=${fileData.name}>
							<input type="text" class="form-control form-group" placeholder="Tag" name="tag" value=${fileData.tag}>
						</div>
						<div class="card-footer bg-body border-0 card-footer d-flex justify-content-between">
							<a href="javascript:void(0)" class="btn btn-primary update-image" data-id="${fileData.id}">Update</a>
							<a href="javascript:void(0)" class="btn btn-danger delete-image" data-id="${fileData.id}">Remove</a>
						</div>
					</div>
				</div>
			</div>
		`;
                gallery.innerHTML += HTML;
            }
}

//*clear rendering area
export function clearGallery() {
    gallery.innerHTML = '';
}

/* ----------------------------------- Drop Area Highlights ---------------------------------- */

//*highlight the drop area
export function highlight() {
    dropArea.classList.add('highlight');
}

//*un highlight the drop area
export function unHighlight() {
    dropArea.classList.remove('highlight');
}

//loading button
export function isLoading(button, isLoading, text) {
    button.disabled = isLoading;
    button.innerHTML = isLoading ? 'Loading...' : text;
}

/* ----------------------------------- FileHelper ---------------------------------- */

//*render the files to the gallery and upload to server
export async function uploadFiles(filesData) {
    //clear rendering area
    clearGallery();

    //*loop through the files and preview them
    filesData.forEach((file, key) => {
        //save file id to files array
        filesData[key].id = key + 1; //?to not start with 0
        //*render the file to the gallery
        renderFile(file);
    });

    //*upload file to database
    return new Promise(async (resolve) => {
        filesData.forEach(async (file, key) => {
            // Allowing file type

            if (!allowedExtensions.exec(file.name)) {
                let text = 'Not a supported image format. Supported formats: GIF, TIFF, PSD, EPS, INDD, RAW, JPEG, PNG, SVG, JPG, WEBP, PDF, DOX, ODT, TEX, TXT, WPD, BMP';
                imgAlert(file.id, text);
                return false;
            }
            //?upload file to server if the uploaded status is false
            if (!file.uploaded) {
                try {
                    const response = await saveImageToServer(file);
                    //?if the upload was successful, update the uploaded status
                    filesData[key].serverID = response.body.id ?? null;
//         filesData[key].uploaded = true;
                    //resolve the promise
                    resolve();

                    if (response["code"] === 200 || response["code"] === 201) {
                        let text = 'Upload successful. Please update this image with a more appropriate title, ' +
                            'if necessary. You may also delete the image completely if the upload wasn\'t required.';
                        imgAlert(file.id, text);

                    } else {
                        let text = 'Sorry, upload failed.';
                        imgAlert(file.id, text);

                    }
                } catch (error) {
                    resolve();
                }
            }
        });
    });
}

function imgAlert(name, text) {
    document.getElementById(name).innerHTML = text;

}

/* ----------------------- upload the image to server ----------------------- */
async function saveImageToServer(file) {
    return new Promise(async (resolve) => {
        //prepare the data to send to the server
        const formData = new FormData();
        const imageBlob = await base64ToBlob(file.path);
        const fileSRC = new File([imageBlob], file.name, {type: 'file'});

        if (!isValidFileSize(fileSRC)) {
            let text = 'Sorry, upload failed.\n This file is too big. Maximum filesize 32.0 MB.';
            imgAlert(file.id, text);
            return
        }
        formData.append('file', fileSRC);
        formData.append('title', file.name);
        formData.append('tags', file.tag);

        //send the data to the server
        // eslint-disable-next-line no-undef
        const response = await new APIHelper().post('image/create/', formData, {'X-CSRFToken': window.csrf_token});

        resolve(response);
    });
}

function isValidFileSize(fileSRC) {
    return fileSRC.size < 32_000_000;
}

//*convert base64 to blob
function base64ToBlob(base64) {
    return new Promise(async resolve => {
        const file = await fetch(base64);
        const blob = await file.blob();
        resolve(blob);
    });
}

/* ------------------------------- delete file ------------------------------ */
export function deleteFile(fileID, filesData) {
    return new Promise(async (resolve) => {
        //catch server id from files data
        const serverID = filesData.find(file => file.id == fileID).serverID;
        //clear rendering area
        clearGallery();
        //*loop through the files and preview them and exclude the current deleted file
        filesData.forEach(file => {
            if (file.id != fileID) {
                renderFile(file);
            }
        });
        try {
            // eslint-disable-next-line no-undef
            const response = await new APIHelper().delete(
                'media/' + serverID + '/delete/',
                {},
                {'X-CSRFToken': window.csrf_token}
            );

            resolve(response);
        } catch (error) {
            resolve(error);
        }
    });
}

/* ------------------------------- update file ------------------------------ */
export function updateFile(fileID, filesData) {
    //catch current file data
    const file = filesData.find(file => file.id == fileID);
    return new Promise(async (resolve) => {
        //prepare the data to send to the server
        const formData = new FormData();
        formData.append('tags', file.tag);
        formData.append('title', file.name);
        formData.append('id', file.serverID);
        try {
            // eslint-disable-next-line no-undef
            const response = await new APIHelper().put('/media/' + file.serverID + '/edit/', formData, {
                'X-CSRFToken': window.csrf_token,
            });

            let text = 'File updated.';
            imgAlert(file.id, text);

            resolve(response);
        } catch (error) {
            resolve(error);
        }
    });
}

/* ----------------------- APIHelper ----------------------- */

/* --- this a helper class to simplify sending http requests to the server -- */

export class APIHelper {
    #BASE_URL = '/api/dashboard/v1/';
    #BASE_HEADERS = {"Accept": "application/json"};

    //ANCHOR send post requests
    post(URI, data, headers = {}) {
        const requestURI = this.#BASE_URL + this.#prepareURI(URI);
        const requestHeaders = {...this.#BASE_HEADERS, ...headers};
        //send ajax request
        return new Promise(async (resolve, reject) => {
            try {
                const connection = await fetch(requestURI, {
                    method: "POST",
                    headers: requestHeaders,
                    body: data,
                });
                const response = await connection.json();
                resolve({code: connection.status, body: response});
            } catch (error) {
                reject(error);
            }
        });
    }

    #prepareURI(URI) {
        //remove the first slash if it exists
        if (URI.startsWith('/')) {
            URI = URI.substring(1);
        }
        return URI;
    }

    //ANCHOR send put requests
    put(URI, data, headers = {}) {
        const requestURI = this.#BASE_URL + this.#prepareURIE(URI);
        const requestHeaders = {...this.#BASE_HEADERS, ...headers};
        //send ajax request
        return new Promise(async (resolve, reject) => {
            try {
                const connection = await fetch(requestURI, {
                    method: "PUT",
                    headers: requestHeaders,
                    body: data,
                });
                const response = await connection.json();
                resolve({code: connection.status, body: response});
            } catch (error) {
                reject(error);
            }
        });
    }

    #prepareURIE(URI) {
        //remove the first slash if it exists
        if (URI.startsWith('/')) {
            URI = URI.substring(1);
        }
        return URI;
    }

    //ANCHOR send delete requests
    delete(URI, data, headers = {}) {
        const requestURI = this.#BASE_URL + this.#prepareURID(URI);
        const requestHeaders = {...headers};
        //send ajax request
        return new Promise(async (resolve, reject) => {
            try {
                const connection = await fetch(requestURI, {
                    method: "DELETE",
                    headers: requestHeaders,

                });
                const response = await connection.json();
                resolve({code: connection.status, body: response});
            } catch (error) {
                reject(error);
            }
        });
    }

    #prepareURID(URI) {
        //remove the first slash if it exists
        if (URI.startsWith('/')) {
            URI = URI.substring(1);
        }
        return URI;
    }
}


