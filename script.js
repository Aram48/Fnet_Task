document.addEventListener('DOMContentLoaded', function () {
    // Get the sidebar and hamburger menu elements
    const sidebarElement = document.querySelector('.managment');
    const closeSidebarButton = document.querySelector('.sidebarClose');
    const hamburgerMenu = document.getElementById('hamburgerMenu');

    if (sidebarElement && closeSidebarButton && hamburgerMenu) {
        closeSidebarButton.addEventListener('click', () => {
            sidebarElement.classList.add('closed'); 
            hamburgerMenu.classList.add('show');    
        });

        hamburgerMenu.addEventListener('click', () => {
            sidebarElement.classList.toggle('show');
            if (sidebarElement.classList.contains('closed')) {
                sidebarElement.classList.remove('closed'); 
                sidebarElement.classList.add('show'); 
                hamburgerMenu.classList.remove('show'); 
            }
        });
    } else {
        console.error("One or more elements not found in the DOM.");
    }

    // Fetching user data
    axios.get('https://mocki.io/v1/fe7ebfbd-fe73-449a-8408-1cd4eb79395e')
        .then(res => {
            const users = res.data;
            const pageContent = document.querySelector('.page-content');

            const userList = document.createElement('div');
            userList.classList.add('user-list');

            users.forEach((user, index) => {
                const userDiv = document.createElement('div');
                userDiv.classList.add('user-item');

                userDiv.innerHTML = `
                    <div class="actions">
                        <img src="./image/actions.png" alt="Action Icon" class="action-image">
                        <div class="edit-actions-button">
                            <img src="./image/edit.png" />
                            <button class="edit-button" data-index="${index}">Edit</button>
                        </div>
                        <div class="delete-actions-button">
                            <img src="./image/delete.png" />
                            <button class="delete-button" data-index="${index}">Delete</button>
                        </div>
                    </div>
                    <div class="profile-picture">
                        <img src='./image/avatar.png' alt="Profile Picture">
                    </div>
                    <div class="user-info">
                        <h3>${user.name} ${user.surname}</h3>
                        <button class="details-button" data-index="${index}">Details</button>
                    </div>
                `;

                userList.appendChild(userDiv);
            });

            pageContent.appendChild(userList);

            // Add event listeners for the Edit and Delete buttons
            const editButtons = document.querySelectorAll('.edit-button');
            const deleteButtons = document.querySelectorAll('.delete-button');

            // Edit Button - Open the modal to edit user info
            editButtons.forEach((button) => {
                button.addEventListener('click', (e) => {
                    const userIndex = e.target.getAttribute('data-index');
                    const user = users[userIndex];

                    // Pre-fill the modal form with user data
                    const modal = document.getElementById('userEditModal');
                    const nameInput = modal.querySelector('#name');
                    const surnameInput = modal.querySelector('#surname');
                    const emailInput = modal.querySelector('#email');
                    const phoneInput = modal.querySelector('#phone');

                    nameInput.value = user.name;
                    surnameInput.value = user.surname;
                    emailInput.value = user.email;
                    phoneInput.value = user.phoneNumber;

                    // Show the modal
                    modal.classList.remove('hidden');

                    // Save edited user info when submitting the form
                    const saveButton = modal.querySelector('#saveButton');
                    saveButton.onclick = () => {
                        // Update the user object with new values
                        user.name = nameInput.value;
                        user.surname = surnameInput.value;
                        user.email = emailInput.value;
                        user.phoneNumber = phoneInput.value;

                        // Update the DOM to reflect the changes
                        const userDiv = document.querySelectorAll('.user-item')[userIndex];
                        userDiv.querySelector('.user-info h3').textContent = `${user.name} ${user.surname}`;

                        // Optionally send updated data to the server
                        axios.put(`https://your-api-endpoint/users/${user.id}`, {
                            name: user.name,
                            surname: user.surname,
                            email: user.email,
                            phoneNumber: user.phoneNumber
                        })
                            .then(() => {
                                // Successfully updated on the server
                                console.log(`User ${user.name} updated successfully.`);
                            })
                            .catch(err => {
                                console.error('Error updating user on the server:', err);
                            });

                        // Close the modal
                        modal.classList.add('hidden');
                    };

                    // Close the modal when clicking the close button
                    const closeButton = modal.querySelector('#closeButton');
                    closeButton.onclick = () => {
                        modal.classList.add('hidden');
                    };

                    // Close the modal when clicking the close image
                    const closeImage = modal.querySelector('#modalCloseImage');
                    closeImage.onclick = () => {
                        modal.classList.add('hidden');
                    };
                });
            });

            // DELETE Button - Handling user deletion
            deleteButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    const user = users[index]; 

                    if (user) {
                        // Display delete confirmation modal with the user's name
                        const deleteMessage = document.getElementById('deleteMessage');
                        deleteMessage.textContent = `Are you sure you want to delete ${user.name} ${user.surname}?`;
                        document.getElementById('deleteConfirmationModal').classList.remove('hidden');
                        document.getElementById('modalOverlay').classList.remove('hidden');

                        // Confirm delete action
                        const confirmDeleteButton = document.getElementById('confirmDeleteButton');
                        const cancelDeleteButton = document.getElementById('cancelDeleteButton');
                        const successModal = document.getElementById('deleteSuccessModal');
                        const modalOverlay = document.getElementById('modalOverlay');
                        let deletedUser = null; 

                        const confirmDeleteHandler = () => {
                            deletedUser = user;

                            document.getElementById('deleteConfirmationModal').classList.add('hidden');

                            successModal.classList.add('show');
                            modalOverlay.classList.add('show');

                            // Remove the user div from the DOM
                            const userDiv = document.querySelectorAll('.user-item')[index];
                            if (userDiv) userDiv.remove();

                            confirmDeleteButton.removeEventListener('click', confirmDeleteHandler);
                            cancelDeleteButton.removeEventListener('click', cancelDeleteHandler);
                        };

                        const cancelDeleteHandler = () => {
                            document.getElementById('deleteConfirmationModal').classList.add('hidden');
                            modalOverlay.classList.add('hidden');

                            confirmDeleteButton.removeEventListener('click', confirmDeleteHandler);
                            cancelDeleteButton.removeEventListener('click', cancelDeleteHandler);
                        };

                        confirmDeleteButton.addEventListener('click', confirmDeleteHandler);
                        cancelDeleteButton.addEventListener('click', cancelDeleteHandler);
                    }
                });
            });

            // Close the success modal when "Ok, thanks" is clicked
            document.getElementById('closeSuccessButton').addEventListener('click', () => {
                const successModal = document.getElementById('deleteSuccessModal');
                const modalOverlay = document.getElementById('modalOverlay');

                if (successModal && modalOverlay) {
                    // Hide the modal and overlay
                    successModal.classList.remove('show');
                    modalOverlay.classList.remove('show');

                    // Reset the deletedUser object after use
                    deletedUser = null;
                }
            });


            // Existing functionality for "Details" button
            const detailsButtons = document.querySelectorAll('.details-button');
            const detailsModal = document.getElementById('actionModal');
            const modalContent = detailsModal.querySelector('.modal-content');

            detailsButtons.forEach((button) => {
                button.addEventListener('click', (e) => {
                    const userIndex = e.target.getAttribute('data-index');
                    const user = users[userIndex];

                    // Update modal content with user details
                    modalContent.innerHTML = `
                        <span id="closeDetailsModal" class="close-button">
                            <img src="./image/cancel_close.png" alt="close">
                        </span>
                        <label>Role</label>
                        <p>${user.role}</p>
                        <label>Occupation</label>
                        <p>${user.occupation}</p>
                        <label>Email address</label>
                        <p>${user.email}</p>
                        <label>Phone number</label>
                        <p>${user.phoneNumber}</p>
                    `;

                    detailsModal.classList.remove('hidden');

                    // Close the modal when clicking the close button
                    document.getElementById('closeDetailsModal').addEventListener('click', () => {
                        detailsModal.classList.add('hidden');
                    });
                });
            });

            // Close modal when clicking outside the modal content
            window.addEventListener('click', (event) => {
                if (event.target === detailsModal) {
                    detailsModal.classList.add('hidden');
                }
            });
        })
        .catch(err => {
            console.error('Error fetching user data:', err);
            const pageContent = document.querySelector('.page-content');
            pageContent.innerHTML = `<p>Error loading user data. Please try again later.</p>`;
        });
});