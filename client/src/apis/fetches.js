

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
        const response = await fetch('http://localhost:3001/api/randomStations');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    }
    catch(err){
        return {}
    }
}

export { fetchStations, fetchStartEndStations, fetchConnections }