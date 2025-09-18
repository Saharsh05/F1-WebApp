// Fetch driver data from backend by name
async function fetchDriverByName(name) {
    try {
      const response = await fetch(`/v1/drivers?driver_name=${encodeURIComponent(name)}`);
      const result = await response.json();
      return result.data[0]; // Get first match
    } catch (err) {
      console.error("Failed to fetch driver:", err);
      return null;
    }
  }
  
  // Update profile info
  async function updateDriver(name) {
    const d = await fetchDriverByName(name);
    if (!d) return;
  
    document.getElementById("driver-name").textContent = d.driver_name;
    document.getElementById("driver-number").textContent = d.driver_number
      ? `Driver Number: ${d.driver_number}`
      : "Driver Number: N/A";
    document.getElementById("driver-team").textContent = d.driver_team
      ? `Team ID: ${d.driver_team}`
      : "Team: N/A";
  }
  
  // Listen for clicks in sidebar
  document.querySelectorAll(".driver-list a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const driverName = link.textContent.trim(); // use link text for lookup
      updateDriver(driverName);
    });
  });
  
  // Initialize with Verstappen (default)
  updateDriver("Verstappen");
  