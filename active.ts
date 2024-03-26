function getMonthlyActiveUsers(data: UserDeviceEvent[]): Map<string, number> {
  const monthlyActiveUsers: Map<string, number> = new Map();

  function getMonthYearString(timestamp: number): string {
    return new Date(timestamp).toISOString().slice(0, 7);
  }

  // Function to check if "lastSeenAt" is within the active timeframe for the month
  function checkActiveWithinTimeframe(timestamp: number, monthYear: string): boolean {
    const targetMonthFirstDay = new Date(monthYear + "-01");
    const lastDayOfMonth = new Date(targetMonthFirstDay.getFullYear(), targetMonthFirstDay.getMonth() + 1, 0);
    const thresholdDate = new Date(lastDayOfMonth);
    thresholdDate.setDate(thresholdDate.getDate() - 2); 
    const timestampDate = new Date(timestamp);
    return timestampDate >= thresholdDate && timestampDate <= lastDayOfMonth;
  }

  data.forEach((userEvent) => {
    const userId = userEvent.userId;
    const activeTimestamps: number[] = []; // Store timestamps for logins and active events within the month

    userEvent.timestamps.forEach((timestampEvent) => {
      const monthYear = getMonthYearString(timestampEvent.timestamp);

      if (timestampEvent.type === "logged_in") {
        // Store the first login timestamp for the month
        if (!activeTimestamps.includes(timestampEvent.timestamp)) {
          activeTimestamps.push(timestampEvent.timestamp);
        }
      } else if (["logged_out", "lastSeenAt"].includes(timestampEvent.type) && monthYear === getMonthYearString(userEvent.timestamps[userEvent.timestamps.length - 1].timestamp)) {
        const isActive = checkActiveWithinTimeframe(timestampEvent.timestamp, monthYear);
        if (isActive) {
          // User was active within the timeframe (no need to add timestamp again)
          activeTimestamps.push(timestampEvent.timestamp); // Can be replaced with a flag for efficiency
        }
      }
    });

    if (activeTimestamps.length > 0) {
      // User was active in this month, update count
      const count = monthlyActiveUsers.get(getMonthYearString(activeTimestamps[0])) || 0;
      monthlyActiveUsers.set(getMonthYearString(activeTimestamps[0]), count + 1);
    }
  });

  return monthlyActiveUsers;
}

interface UserDeviceEvent {
  userId: string;
  timestamps: { type: string; timestamp: number }[];
}
