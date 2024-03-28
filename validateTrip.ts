function validateTrips(shipment: Shipment, trips: Trip[]): boolean {
  const pickups = shipment.pickupPoints;
  const dropPoints = shipment.dropPoints;
  const warehouse: string | undefined = getWarehouseFromTrips(trips); 

  // Check for warehouse consistency
  if (warehouse && !allTripsUseSameWarehouse(trips, warehouse)) {
    return false;
  }

  // Check pickup completion
  const visitedPickups = new Set<string>();
  for (const trip of trips) {
    for (const pickup of trip.pickupPoints) {
      if (visitedPickups.has(pickup)) {
        return false; // Duplicate pickup
      }
      visitedPickups.add(pickup);
    }
  }
  if (!visitedPickups.size || !allPickupsVisited(visitedPickups, pickups)) {
    return false; // Missing pickups
  }

  // Check drop point completion
  const visitedDropPoints = new Set<string>();
  for (const trip of trips) {
    for (const dropPoint of trip.dropPoints) {
      if (visitedDropPoints.has(dropPoint)) {
        return false; // Duplicate drop point
      }
      visitedDropPoints.add(dropPoint);
    }
  }
  if (!visitedDropPoints.size || !allDropPointsVisited(visitedDropPoints, dropPoints)) {
    return false; // Missing drop points
  }

  return true;
}

function getWarehouseFromTrips(trips: Trip[]): string | undefined {
  const warehouses = new Set<string>();
  for (const trip of trips) {
    if (trip.warehouse) {
      warehouses.add(trip.warehouse);
    }
  }
  return warehouses.size === 1 ? warehouses.values().next().value : undefined;
}

function allTripsUseSameWarehouse(trips: Trip[], warehouse: string): boolean {
  return trips.every((trip) => trip.warehouse === warehouse);
}

function allPickupsVisited(visitedPickups: Set<string>, pickups: string[]): boolean {
  return visitedPickups.size === pickups.length;
}

function allDropPointsVisited(visitedDropPoints: Set<string>, dropPoints: string[]): boolean {
  return visitedDropPoints.size === dropPoints.length;
}

interface Shipment {
  pickupPoints: string[]; // List of pick-up points
  dropPoints: string[]; // List of drop-off points
  warehouse?: string; // Optional warehouse 
}

interface Trip {
  pickupPoints: string[]; // List of pick-up points in this trip
  dropPoints: string[]; // List of drop-off points in this trip
  warehouse?: string; // Optional warehouse waypoint in this trip
}

// Test cases
const testCases: { shipment: Shipment, trips: Trip[], expected: boolean }[] = [
  // Test case 1: Basic Case
  {
    shipment: {
      pickupPoints: ['A', 'B', 'C'],
      dropPoints: ['X', 'Y', 'Z']
    },
    trips: [{
      pickupPoints: ['A', 'B', 'C'],
      dropPoints: ['X', 'Y', 'Z']
    }],
    expected: true
  },
  // Test case 2: Case with Missing Pickups or Drop Points
  {
    shipment: {
      pickupPoints: ['A', 'B', 'C'],
      dropPoints: ['X', 'Y', 'Z']
    },
    trips: [{
      pickupPoints: ['A', 'C'], // Missing pickup point 'B'
      dropPoints: ['X', 'Y', 'Z']
    }],
    expected: false
  },
  // Test case 3: Case with Duplicate Pickups or Drop Points
  {
    shipment: {
      pickupPoints: ['A', 'B', 'C'],
      dropPoints: ['X', 'Y', 'Z']
    },
    trips: [{
      pickupPoints: ['A', 'B', 'C', 'A'], // Duplicate pickup point 'A'
      dropPoints: ['X', 'Y', 'Z']
    }],
    expected: false
  },
  // Test case 4: Case with Multiple Trips
  {
    shipment: {
      pickupPoints: ['A', 'B', 'C'],
      dropPoints: ['X', 'Y', 'Z']
    },
    trips: [{
      pickupPoints: ['A', 'B'],
      dropPoints: ['X']
    }, {
      pickupPoints: ['C'],
      dropPoints: ['Y', 'Z']
    }],
    expected: true
  }
];

// Running test cases
testCases.forEach((testCase, index) => {
  console.log(`Test Case ${index + 1}:`);
  console.log(`Shipment:`, testCase.shipment);
  console.log(`Trips:`, testCase.trips);
  console.log(`Expected Output:`, testCase.expected);
  console.log(`Result:`, validateTrips(testCase.shipment, testCase.trips));
  console.log(`---`);
});
