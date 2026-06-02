from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms


BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

# 분리 후 구조: archive/, model/ 모두 backend/ 안으로 이동
DATA_DIR = BASE_DIR / "archive"
MODEL_SAVE_PATH = BASE_DIR / "model" / "waste_model.pth"

BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.0001
PATIENCE = 5
IMAGE_SIZE = 260


def check_dataset_path() -> None:
    train_dir = DATA_DIR / "train"
    valid_dir = DATA_DIR / "valid"

    if not DATA_DIR.exists():
        raise FileNotFoundError(f"Dataset folder not found: {DATA_DIR}")
    if not train_dir.exists():
        raise FileNotFoundError(f"Train folder not found: {train_dir}")
    if not valid_dir.exists():
        raise FileNotFoundError(f"Valid folder not found: {valid_dir}")


def build_dataloaders():
    train_transform = transforms.Compose([
        transforms.Resize((300, 300)),
        transforms.RandomResizedCrop(IMAGE_SIZE, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(
            brightness=0.2,
            contrast=0.2,
            saturation=0.2,
        ),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

    valid_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

    train_dataset = datasets.ImageFolder(
        root=DATA_DIR / "train",
        transform=train_transform,
    )
    valid_dataset = datasets.ImageFolder(
        root=DATA_DIR / "valid",
        transform=valid_transform,
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
    )
    valid_loader = DataLoader(
        valid_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
    )

    return train_dataset, valid_dataset, train_loader, valid_loader


def build_model(class_count: int, device: torch.device):
    model = models.efficientnet_b2(
        weights=models.EfficientNet_B2_Weights.DEFAULT,
    )
    model.classifier[1] = nn.Linear(1408, class_count)
    return model.to(device)


def train_one_epoch(model, train_loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0

    for images, labels in train_loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    return running_loss / max(len(train_loader), 1)


def evaluate(model, valid_loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in valid_loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)
            running_loss += loss.item()

            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    valid_loss = running_loss / max(len(valid_loader), 1)
    accuracy = 100 * correct / total if total > 0 else 0
    return valid_loss, accuracy, correct, total


def save_checkpoint(model, class_names, best_accuracy):
    MODEL_SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)

    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "class_names": class_names,
            "model_name": "efficientnet_b2",
            "image_size": IMAGE_SIZE,
            "best_accuracy": best_accuracy,
        },
        MODEL_SAVE_PATH,
    )


def main():
    check_dataset_path()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_dataset, valid_dataset, train_loader, valid_loader = build_dataloaders()
    class_names = train_dataset.classes

    print("Training started")
    print(f"Device: {device}")
    print(f"Dataset: {DATA_DIR}")
    print(f"Classes: {class_names}")
    print(f"Train images: {len(train_dataset)}")
    print(f"Valid images: {len(valid_dataset)}")
    print(f"Save path: {MODEL_SAVE_PATH}")
    print("-" * 60)

    model = build_model(len(class_names), device)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=LEARNING_RATE,
        weight_decay=0.0001,
    )

    best_accuracy = 0.0
    no_improve_count = 0

    for epoch in range(EPOCHS):
        train_loss = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
            device,
        )
        valid_loss, accuracy, correct, total = evaluate(
            model,
            valid_loader,
            criterion,
            device,
        )

        print(
            f"Epoch {epoch + 1:02d}/{EPOCHS} | "
            f"train loss: {train_loss:.4f} | "
            f"valid loss: {valid_loss:.4f} | "
            f"valid accuracy: {accuracy:.2f}% ({correct}/{total})"
        )

        if accuracy > best_accuracy:
            best_accuracy = accuracy
            no_improve_count = 0
            save_checkpoint(model, class_names, best_accuracy)
            print(f"Best model saved: {best_accuracy:.2f}%")
        else:
            no_improve_count += 1
            print(f"No improvement: {no_improve_count}/{PATIENCE}")

        if no_improve_count >= PATIENCE:
            print("Early stopping: validation accuracy did not improve.")
            break

    print("-" * 60)
    print(f"Training finished. Best valid accuracy: {best_accuracy:.2f}%")
    print(f"Final model path: {MODEL_SAVE_PATH}")


if __name__ == "__main__":
    main()
