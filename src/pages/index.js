import "core-js/stable";
import "./index.css";
import Api from "../utils/Api.js";
import {
  enableValidation,
  resetValidation,
  settings,
} from "../scripts/validation.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "1897cb5a-094f-49d1-96dd-579d142e468d",
    "Content-Type": "application/json",
  },
});

const editProfileButton = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton = editProfileModal.querySelector(
  ".modal__close-button",
);
const editProfileFormEl = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);
const editProfileSubmitButton =
  editProfileFormEl.querySelector(".modal__button");

const avatarEditButton = document.querySelector(".profile__avatar-edit-button");
const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarCloseButton = avatarModal.querySelector(".modal__close-button");
const avatarFormEl = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#avatar-link-input");
const avatarSubmitButton = avatarFormEl.querySelector(".modal__button");

const newPostButton = document.querySelector(".profile__add-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseButton = newPostModal.querySelector(".modal__close-button");
const newPostFormEl = newPostModal.querySelector(".modal__form");
const newPostImageInput = newPostModal.querySelector("#card-image-input");
const newPostCaptionInput = newPostModal.querySelector(
  "#profile-caption-input",
);
const newPostSubmitButton = newPostFormEl.querySelector(".modal__button");

const deleteCardModal = document.querySelector("#delete-card-modal");
const deleteCardCloseButton = deleteCardModal.querySelector(
  ".modal__close-button",
);
const deleteCardFormEl = deleteCardModal.querySelector(".modal__form");
const deleteCardSubmitButton = deleteCardModal.querySelector(
  ".modal__button_type_delete",
);
const deleteCardCancelButton = deleteCardModal.querySelector(
  ".modal__button_type_cancel",
);

const cardsListEl = document.querySelector(".cards__list");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseButton = previewModal.querySelector(
  ".modal__close-button",
);
const previewImageElement = previewModal.querySelector(".modal__image");
const previewCaptionElement = previewModal.querySelector(".modal__title");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");

const modalList = document.querySelectorAll(".modal");

let openedModal = null;
let currentUserId = null;
let cardToDelete = null;

function renderLoading(isLoading, button, defaultText) {
  button.textContent = isLoading ? "Saving..." : defaultText;
}

function setProfileAvatar(src) {
  const avatarImage = new Image();
  avatarImage.src = src;
  avatarImage.onload = () => {
    profileAvatarEl.src = src;
    profileAvatarEl.classList.remove("profile__avatar_loading");
  };
  avatarImage.onerror = () => {
    profileAvatarEl.classList.remove("profile__avatar_loading");
    console.error("Could not load avatar image. Check that the URL is valid.");
  };
}

function renderCards(cards) {
  cardsListEl.querySelectorAll(".card").forEach((card) => card.remove());

  cards.forEach((cardData) => {
    const cardElement = getCardElement(cardData);
    cardsListEl.append(cardElement);
  });
}

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleElement = cardElement.querySelector(".card__title");
  const cardImageElement = cardElement.querySelector(".card__image");
  const cardLikeButtonElement = cardElement.querySelector(".card__like-button");
  const cardDeleteButtonElement = cardElement.querySelector(
    ".card__delete-button",
  );

  cardImageElement.src = data.link;
  cardImageElement.alt = data.name;
  cardTitleElement.textContent = data.name;

  if (data.isLiked) {
    cardLikeButtonElement.classList.add("card__like-button_active");
  }

  cardLikeButtonElement.addEventListener("click", () => {
    const isLiked = cardLikeButtonElement.classList.contains(
      "card__like-button_active",
    );

    api
      .changeLikeCardStatus(data._id, isLiked)
      .then((updatedCard) => {
        cardLikeButtonElement.classList.toggle(
          "card__like-button_active",
          updatedCard.isLiked,
        );
      })
      .catch(console.error);
  });

  const ownerId = data.owner?._id || data.owner;

  if (ownerId && currentUserId && ownerId !== currentUserId) {
    cardDeleteButtonElement.remove();
  } else {
    cardDeleteButtonElement.addEventListener("click", () => {
      cardToDelete = { data, element: cardElement };
      openModal(deleteCardModal);
    });
  }

  cardImageElement.addEventListener("click", () => {
    previewImageElement.src = data.link;
    previewImageElement.alt = data.name;
    previewCaptionElement.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function handleEscClose(evt) {
  if (evt.key === "Escape" && openedModal) {
    closeModal(openedModal);
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  openedModal = modal;
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscClose);
  openedModal = null;
}

modalList.forEach((modal) => {
  modal.addEventListener("click", function (evt) {
    if (evt.target.classList.contains("modal")) {
      closeModal(modal);
    }
  });
});

editProfileButton.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(editProfileFormEl, settings);
  openModal(editProfileModal);
});

editProfileCloseButton.addEventListener("click", function () {
  closeModal(editProfileModal);
});

avatarEditButton.addEventListener("click", function () {
  resetValidation(avatarFormEl, settings);
  openModal(avatarModal);
});

avatarCloseButton.addEventListener("click", function () {
  avatarFormEl.reset();
  resetValidation(avatarFormEl, settings);
  closeModal(avatarModal);
});

newPostButton.addEventListener("click", function () {
  resetValidation(newPostFormEl, settings);
  openModal(newPostModal);
});

newPostCloseButton.addEventListener("click", function () {
  newPostFormEl.reset();
  resetValidation(newPostFormEl, settings);
  closeModal(newPostModal);
});

previewModalCloseButton.addEventListener("click", function () {
  closeModal(previewModal);
});

deleteCardCloseButton.addEventListener("click", function () {
  cardToDelete = null;
  closeModal(deleteCardModal);
});

deleteCardCancelButton.addEventListener("click", function () {
  cardToDelete = null;
  closeModal(deleteCardModal);
});

enableValidation(settings);

editProfileFormEl.addEventListener("submit", function (evt) {
  evt.preventDefault();

  if (!editProfileFormEl.checkValidity()) {
    return;
  }

  renderLoading(true, editProfileSubmitButton, "Save");

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((userData) => {
      profileNameEl.textContent = userData.name;
      profileDescriptionEl.textContent = userData.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, editProfileSubmitButton, "Save");
    });
});

avatarFormEl.addEventListener("submit", function (evt) {
  evt.preventDefault();

  if (!avatarFormEl.checkValidity()) {
    return;
  }

  renderLoading(true, avatarSubmitButton, "Save");

  api
    .updateAvatar({ avatar: avatarInput.value.trim() })
    .then((userData) => {
      const avatarImage = new Image();
      avatarImage.src = userData.avatar;
      avatarImage.onload = () => {
        profileAvatarEl.src = userData.avatar;
        avatarFormEl.reset();
        resetValidation(avatarFormEl, settings);
        closeModal(avatarModal);
      };
      avatarImage.onerror = () => {
        console.error(
          "Avatar was saved, but the image URL could not be loaded. Try a direct link to a .jpg or .png file.",
        );
      };
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, avatarSubmitButton, "Save");
    });
});

newPostFormEl.addEventListener("submit", function (evt) {
  evt.preventDefault();

  if (!newPostFormEl.checkValidity()) {
    return;
  }

  renderLoading(true, newPostSubmitButton, "Save");

  api
    .addCard({
      name: newPostCaptionInput.value.trim(),
      link: newPostImageInput.value.trim(),
    })
    .then((cardData) => {
      const cardEl = getCardElement(cardData);
      cardsListEl.prepend(cardEl);
      newPostFormEl.reset();
      resetValidation(newPostFormEl, settings);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, newPostSubmitButton, "Save");
    });
});

deleteCardFormEl.addEventListener("submit", function (evt) {
  evt.preventDefault();

  if (!cardToDelete) {
    return;
  }

  deleteCardSubmitButton.textContent = "Deleting...";

  api
    .deleteCard(cardToDelete.data._id)
    .then(() => {
      cardToDelete.element.remove();
      cardToDelete = null;
      closeModal(deleteCardModal);
    })
    .catch(console.error)
    .finally(() => {
      deleteCardSubmitButton.textContent = "Delete";
    });
});

api
  .getAppData()
  .then(([userData, cards]) => {
    currentUserId = userData._id;
    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    profileAvatarEl.alt = `${userData.name} avatar`;
    setProfileAvatar(userData.avatar);
    renderCards(cards);
  })
  .catch(console.error);
