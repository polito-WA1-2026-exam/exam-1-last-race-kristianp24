

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

export { fetchStations }