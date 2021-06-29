

       let getDataForId = function (id, data) {
        let fromData = data.filter(x => x.fromId == id)
        let toData = data.filter(x => x.toId == id)

        if (fromData.length < 1) {
            return { "jobTitle" : toData[0].toJobtitle, "email" : toData[0].toEmail}
        } else {
            return { "jobTitle" : fromData[0].fromJobtitle, "email" : fromData[0].fromEmail}
        }

    }



    fetch("./data.json")
        .then(response => {
            return response.json();
        })
        .then(data => {


            /* Get unique Ids */
            let uniqueFromIds = Array.from(new Set(data.map(({fromId}) => fromId)));
            let uniqueToIds = Array.from(new Set(data.map(({toId}) => toId)));
            let uniqueIds = Array.from(new Set(uniqueToIds.concat(uniqueFromIds)))



            /* Unique Data for each Id  */
            var dataset = uniqueIds.map(id => {



                let setOfRelevantDataPre = getDataForId(id,data)
                let setOfRelevantData = data.filter(x => x.fromId == id && x.toId != id)
                let setOfUniqueToIds = Array.from(new Set(setOfRelevantData.map(({toId}) => toId)));

                let uniqueSentList = setOfUniqueToIds.map(toId => "flare:" + setOfRelevantData.find(x => x.toId == toId).toJobtitle + ":" + setOfRelevantData.find(x => x.toId == toId).toEmail)
                let sentimentData = setOfUniqueToIds.map(toId => setOfRelevantData.find(x => x.toId == toId).sentiment) // Added the sentiment of each email to the formatted dataset

                return {
                    name: "flare:" + setOfRelevantDataPre.jobTitle +  ":" + setOfRelevantDataPre.email,
                    imports: ":" + uniqueSentList,
                    size: setOfRelevantData.length,
                    sentiment: sentimentData // Added the sentiment of each email to the formatted dataset, so imports[0] corresponds with sentiment[0]
                }


            });

            //downloadObject(dataset,'data-formatted.json')
        })

    function downloadObject(obj, filename){
        var blob = new Blob([JSON.stringify(obj, null, 2)], {type: "application/json;charset=utf-8"}).slice(2,-1);
        var url = URL.createObjectURL(blob);
        var elem = document.createElement("a");
        elem.href = url;
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }




   