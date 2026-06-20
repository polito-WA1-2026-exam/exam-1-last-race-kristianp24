

async function fetchStations() {
    try {
        const response = await fetch('http://localhost:3001/api/stations');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        
        return {};
    }
}

async function fetchConnections(){
    try{
        const response = await fetch('http://localhost:3001/api/connections');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    }
    catch(err){
        return {}
    }
}

async function fetchStartEndStations(){
    try{
        const response = await fetch('http://localhost:3001/api/start-game');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    }
    catch(err){
        return {}
    }
}

async function checkRoute(selectedConnections, startCity, destCity){
    try{
        const response = await fetch('http://localhost:3001/api/verify-route', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                submittedRoute: selectedConnections, 
                assignedStart: startCity, 
                assignedDest: destCity 
            }) 
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        return await response.json(); 

    }
    catch(err){
        return {}
    }
}

async function getRandomEvents(numb_events){
    try{
        const response = await fetch('http://localhost:3001/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                numberOfEvenets: numb_events
            }) 
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    }
    catch(err){
        return {}
    }

}

export { fetchStations, fetchStartEndStations, fetchConnections, checkRoute, getRandomEvents }