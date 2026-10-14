
const API = "/api/bookings";

const form = document.getElementById("bookingForm");
const guestInput = document.getElementById("guest");
const roomInput = document.getElementById("room");
const typeInput = document.getElementById("type");
const message = document.getElementById("message");
const bookingList = document.getElementById("bookingList");
const bookingCount = document.getElementById("bookingCount");

let editingId = null;

// Show a status message
function showMessage(text) {
    message.textContent = text;
}

// Add or update a booking
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const booking = {
        guest: guestInput.value.trim(),
        room: roomInput.value.trim(),
        type: typeInput.value
    };

    const isEditing = editingId !== null;

    try {
        // Check existing bookings before adding or updating
        const checkResponse = await fetch(API);
        const bookings = await checkResponse.json();

        if (!checkResponse.ok) {
            throw new Error("Unable to check existing bookings");
        }

        const exists = bookings.some(function (b) {
            return String(b.room).trim().toLowerCase() ===
                       booking.room.toLowerCase() &&
                   b.type === booking.type &&
                   String(b._id) !== String(editingId);
        });

        if (exists) {
            showMessage("Room already booked! Choose another room.");
            return;
        }

        const url = isEditing ? `${API}/${editingId}` : API;
        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(booking)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Request failed");
        }

        showMessage(
            isEditing
                ? "Booking updated successfully!"
                : "Booking added successfully!"
        );

        form.reset();
        editingId = null;

        form.querySelector('button[type="submit"]')
            .textContent = "Book Room";

        await loadBookings();

    } catch (error) {
        showMessage("Error: " + error.message);
    }
});

// Fetch and display all bookings
async function loadBookings() {
    bookingList.textContent = "Loading bookings...";

    try {
        const response = await fetch(API);
        const bookings = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load bookings");
        }

        bookingCount.textContent =
            `Total bookings: ${bookings.length}`;

        bookingList.replaceChildren();

        if (bookings.length === 0) {
            bookingList.textContent = "No bookings found.";
            return;
        }

        bookings.forEach(booking => {
            const card = document.createElement("div");
            card.className = "booking";

            const guest = document.createElement("p");
            guest.textContent = `Guest: ${booking.guest}`;

            const room = document.createElement("p");
            room.textContent = `Room: ${booking.room}`;

            const type = document.createElement("p");
            type.textContent = `Type: ${booking.type}`;

            const editButton = document.createElement("button");
            editButton.className = "edit-btn";
            editButton.textContent = "Edit";

            editButton.addEventListener("click", () => {
                guestInput.value = booking.guest;
                roomInput.value = booking.room;
                typeInput.value = booking.type;

                editingId = booking._id;

                form.querySelector('button[type="submit"]')
                    .textContent = "Update Booking";

                showMessage(
                    "Edit the details and click Update Booking."
                );

                form.scrollIntoView({ behavior: "smooth" });
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteBooking(booking._id);
            });

            card.append(
                guest,
                room,
                type,
                editButton,
                deleteButton
            );

            bookingList.appendChild(card);
        });

    } catch (error) {
        bookingList.textContent =
            "Could not load bookings. " + error.message;
    }
}

// Delete a booking
async function deleteBooking(id) {
    if (!confirm("Do you want to delete this booking?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Delete failed");
        }

        showMessage("Booking deleted successfully!");
        await loadBookings();

    } catch (error) {
        showMessage("Error: " + error.message);
    }
}

// Refresh bookings
document.getElementById("refreshBtn")
    .addEventListener("click", loadBookings);

// Load data when page opens
loadBookings();
