(async () => {
    const theatres = []

    // get current date
    const day = new Date().getDate().toString().split("").length > 1 ? new Date().getDate() : "0" + new Date().getDate();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // format date into format required by <input> tag
    // set a default value to current day
    $("#dateOfDisplay").val(`${year}-${month}-${day}`);

    fetch("https://www.finnkino.fi/xml/TheatreAreas")
        .then(response => response.text())
        .then(data => {
            // extraction
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const schedule = xml.getElementsByTagName("TheatreAreas")[0].children

            // save received data into an array
            for (let i = 0; i < schedule.length; i++) {
                theatres.push({id: schedule[i].children[0].textContent, name: schedule[i].children[1].textContent})
            }


            // append a menu option inside of select tag
            theatres.map(i => document.getElementById("theatres").innerHTML += (`<option value='${i.id}'>${i.name}</option>`))
        })
        .catch(console.error);

    const dataResult = (areaFinder = $('#theatres').find(":selected").val()) => { // assign default value to areaFinder (which is a user selected value from select tag)
        // get value from date input tag
        const dateInput = $("#dateOfDisplay").val();

        // format the inputted date into a format that is required by API
        const splitDate = dateInput.split("-");

        const _day = splitDate[2];
        const _month = splitDate[1];
        const _year = splitDate[0]

        const date = `${_day}.${_month}.${_year}`

        // request specific shows by area and date
        fetch(`https://www.finnkino.fi/xml/Schedule/?area=${areaFinder}&dt=${date}`)
            .then(response => response.text())
            .then(data => {
                // extraction
                const parser = new DOMParser();
                const xml = parser.parseFromString(data, "application/xml");
                const schedule = xml.getElementsByTagName("Schedule")[0].childNodes[3].children

                // clear the container
                document.getElementById("tableContainer").innerHTML = "";

                // create table metadata
                document.getElementById("tableContainer").innerHTML += `<br><br><br><table id="tableMain"><thead><tr><th>Thumbnail</th><th>Movie data</th><th>Duration</th></tr></thead><tbody id="tableBody"></tbody></table>`

                // iterate through each childNode
                for (let i = 0; i < schedule.length; i++) {
                    // set default values in case given childNode (e.g. "Image") doesn't exist
                    let imageUrl = "";
                    let title = "";
                    let durationMinutes = 0;
                    let theatreAuditorium = "";
                    let showStart = "";
                    let eventURL = "";
                    let productionYear = "";
                    let presMethod = "";

                    // iterate through each movie show data
                    for (let j = 0; j < schedule[i].children.length; j++) {
                        const content = schedule[i].children[j];

                        // assign found data into variables
                        switch (content.nodeName) {
                            case "Images":
                                imageUrl = content.children[1].textContent;
                                break;

                            case "Title":
                                title = content.textContent;
                                break;

                            case "LengthInMinutes":
                                durationMinutes = content.textContent;
                                break;

                            case "TheatreAndAuditorium":
                                theatreAuditorium = content.textContent;
                                break;

                            case "dttmShowStart":
                                showStart = content.textContent;
                                break;

                            case "EventURL":
                                eventURL = content.textContent;
                                break;

                            case "ProductionYear":
                                productionYear = content.textContent;
                                break;

                            case "PresentationMethodAndLanguage":
                                presMethod = content.textContent;
                                break;
                        }
                    }

                    // format the date to be displayed on the website
                    showStart = new Date(showStart);
                    const showStartMinutes = showStart.getMinutes() === 0 ? showStart.getMinutes() + "0" : showStart.getMinutes();
                    const showStartHours = showStart.getHours() === 0 ? showStart.getHours() + "0" : showStart.getHours();
                    const showStartDay = showStart.getDate().toString().split("").length > 1 ? showStart.getDate() : "0" + showStart.getDate();
                    const showStartMonth = showStart.getMonth() + 1;
                    const showStartYear = showStart.getFullYear();

                    // create thumbnail table cell
                    const image = `<img src="${imageUrl}" alt="Thumbnail not available" height="200px" width="130px">`;

                    // create a table cell with data about the theatre, movie and location
                    const movieData = `
                            <a href="${eventURL}">
                                <span style="font-size: x-large">${title} (${productionYear})</span>
                            </a>
                            <br>
                            <br>
                            ${showStartDay + "." + showStartMonth + "." + showStartYear} &emsp; <b>${showStartHours + ":" + showStartMinutes}</b>
                            <br>
                            <br>
                            ${theatreAuditorium}
                            <br>
                            <br>
                            ${presMethod}`

                    const duration = `${durationMinutes} minutes`;

                    // create a table row for given movie and theatre
                    document.getElementById("tableBody").innerHTML += `<tr><td>${image}</td><td>${movieData}</td><td>${duration}</td></tr>`;
                }
            })
            .catch(console.error);
    }

    // when the search button is clicked
    $("#searchButton").on("click", function () {
        // find theatre names containing the inputted string
        const foundMatches = theatres.find(i => i.name.toLowerCase().includes($("#searchTheatres").val()));

        if (!foundMatches) {
            alert("No matches found for your query.")
            return;
        }

        // send matched theatre ID
        dataResult(foundMatches.id);
    })

    // when a date is selected in <input> tag
    $("#dateOfDisplay").on("change", function () {
        dataResult();
    })

    // when a theare is selected in <select> tag
    $("#theatres").on("change", function () {
        dataResult();
    });
})();