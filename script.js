class Draggable {
  constructor(parentID) {
    this.$parentObject = document.querySelector(`#${parentID}`);
  }
  init(objectSize, borderSize) {
    this.$src = document.createElement("div");
    this.$src.classList.add("element");
    this.$parentObject.append(this.$src);

    const elementClasses = ["left", "right", "bottom", "top"];
    for (const key of elementClasses) {
      const div = document.createElement("div");
      div.classList.add(key);
      this.$src.append(div);
    }

    this.parentsBorderRadius =
      parseInt(
        window.getComputedStyle(this.$parentObject).getPropertyValue("border")
      ) * 2;
    this.$parentObject.state = this.$parentObject.getBoundingClientRect();
    this.moveHandlerBoundMove = this.moveHandler.bind(this);
    this.moveHandlerBoundSize = this.sizeHandler.bind(this);
    this.minStrachSize = borderSize;
    this.changeBorderSize(this.minStrachSize);
    this.canStratch = false;
    this.currentResize = null;
    this.sideValue = {
      left: "left",
      right: "right",
      top: "top",
      bottom: "bottom",
    };
    this.resizeParam = {
      width: "width",
      height: "height",
    };
    this.action = {
      move: "move",
      resize: "resize",
    };
    this.minSize = objectSize;
    this.changeWidth(this.minSize);
    this.changeHeight(this.minSize);
    this.$src.addEventListener("mousedown", this.mouseDown.bind(this));
    window.addEventListener(
      "mousemove",
      this.checkPossibilityToStratch.bind(this)
    );
  }

  checkPossibilityToStratch(e) {
    const info = this.cursorPositionInDraggableObj(e);
    if (info.inObjectRadius) {
      this.resizeLeft = info.left - this.$src.offsetLeft < this.minStrachSize;
      this.resizeRight =
        this.actualWidth - (info.left - this.$src.offsetLeft) <
        this.minStrachSize;
      this.resizeBottom =
        this.actualHeight - (info.top - this.$src.offsetTop) <
        this.minStrachSize;
      this.resizeTop = info.top - this.$src.offsetTop < this.minStrachSize;
      if (
        this.resizeLeft ||
        this.resizeRight ||
        this.resizeTop ||
        this.resizeBottom
      )
        this.canStratch = true;
      else this.canStratch = false;
    } else this.canStratch = false;
  }
  cursorPositionInDraggableObj(cursor) {
    const Y = cursor.clientY - this.$parentObject.state.y;
    const X = cursor.clientX - this.$parentObject.state.x;
    let info = {
      inObjectRadius:
        X > this.$src.offsetLeft &&
        X < this.$src.offsetLeft + this.actualWidth &&
        Y > this.$src.offsetTop &&
        Y < this.$src.offsetTop + this.actualHeight,
      left: X,
      top: Y,
    };

    return info;
  }
  changeBorderSize(size) {
    document.documentElement.style.setProperty("--element-border", `${size}px`);
  }
  changeWidth(width) {
    document.documentElement.style.setProperty("--element-width", `${width}px`);
    this.actualWidth = width;
  }
  changeHeight(height) {
    document.documentElement.style.setProperty(
      "--element-height",
      `${height}px`
    );
    this.actualHeight = height;
  }
  changeLeft(left) {
    document.documentElement.style.setProperty("--element-left", `${left}px`);
  }
  changeTop(top) {
    document.documentElement.style.setProperty("--element-top", `${top}px`);
  }
  mouseDown(e) {
    this.$parentObject.state = this.$parentObject.getBoundingClientRect();
    this.startX =
      e.clientX - this.$parentObject.offsetLeft - this.$src.offsetLeft;
    this.startY =
      e.clientY - this.$parentObject.offsetTop - this.$src.offsetTop;
    this.startOffsetX = this.$src.offsetLeft;
    this.startOffsetY = this.$src.offsetTop;
    this.startWidth = this.actualWidth;
    this.startHeight = this.actualHeight;
    if (this.canStratch) {
      this.currentResize = this.resizeLeft
        ? this.sideValue.left
        : this.resizeRight
        ? this.sideValue.right
        : this.resizeTop
        ? this.sideValue.top
        : this.resizeBottom
        ? this.sideValue.bottom
        : null;
      window.addEventListener("mousemove", this.moveHandlerBoundSize);
    } else window.addEventListener("mousemove", this.moveHandlerBoundMove);
    window.addEventListener("mouseup", this.mouseUp.bind(this));
  }
  mouseUp(e) {
    this.currentResize = null;
    window.removeEventListener("mousemove", this.moveHandlerBoundMove);
    window.removeEventListener("mousemove", this.moveHandlerBoundSize);
    window.removeEventListener("mouseup", this.mouseUp);
  }
  sizeHandler(e) {
    const newLeft = this.calcNewLeft(e.clientX);
    const newTop = this.calcNewTop(e.clientY);
    const newWidth = this.calcNewStratchWidth(newLeft);
    const newHeight = this.calcNewStratchHeight(newTop);
    switch (this.currentResize) {
      case this.sideValue.left:
        this.doResizeLeft(newLeft, newWidth);
        break;
      case this.sideValue.right:
        this.doResizeRight(newWidth);
        break;
      case this.sideValue.top:
        this.doResizeTop(newTop, newHeight);
        break;
      case this.sideValue.bottom:
        this.doResizeBottom(newHeight);
        break;
      default:
        break;
    }
  }
  calcNewLeft(mouseX) {
    let newLeft = mouseX - this.$parentObject.offsetLeft;
    if (
      this.currentResize === this.sideValue.left &&
      newLeft > this.startOffsetX &&
      this.startWidth - (newLeft - this.startOffsetX) < this.minSize
    )
      return (
        newLeft -
        (this.minSize - (this.startWidth - (newLeft - this.startOffsetX)))
      );

    if (newLeft < 0 && this.currentResize === this.sideValue.left) return 0;

    return newLeft;
  }
  calcNewTop(mouseY) {
    let newTop = mouseY - this.$parentObject.offsetTop;
    if (
      this.currentResize === this.sideValue.top &&
      newTop > this.startOffsetY &&
      this.startHeight - (newTop - this.startOffsetY) < this.minSize
    )
      return (
        newTop -
        (this.minSize - (this.startHeight - (newTop - this.startOffsetY)))
      );

    if (newTop < 0 && this.currentResize === this.sideValue.top) return 0;

    return newTop;
  }
  calcNewStratchWidth(newLeft) {
    const offsetWidthOnStartStratch = this.startOffsetX + this.startWidth;
    if (
      newLeft < offsetWidthOnStartStratch &&
      offsetWidthOnStartStratch - newLeft < this.minSize &&
      this.currentResize === this.sideValue.left
    )
      return this.minSize;
    if (newLeft < 0 && this.currentResize === this.sideValue.left)
      return this.startWidth + (this.startOffsetX - newLeft);

    if (
      newLeft < offsetWidthOnStartStratch &&
      newLeft - this.startOffsetX < this.minSize &&
      this.currentResize === this.sideValue.right
    )
      return this.minSize;
    if (
      newLeft > this.$parentObject.state.width &&
      this.currentResize === this.sideValue.right
    )
      return this.$parentObject.state.width - this.startOffsetX;

    return this.currentResize === this.sideValue.right
      ? newLeft - this.startOffsetX
      : offsetWidthOnStartStratch - newLeft;
  }
  calcNewStratchHeight(newTop) {
    const offsetHeightOnStartStratch = this.startOffsetY + this.startHeight;
    debugger;
    if (
      newTop < offsetHeightOnStartStratch &&
      offsetHeightOnStartStratch - newTop < this.minSize &&
      this.currentResize === this.sideValue.top
    )
      return this.minSize;
    if (newTop < 0 && this.currentResize === this.sideValue.top)
      return this.startHeight + (this.startOffsetY - newTop);

    if (
      newTop < offsetHeightOnStartStratch &&
      newTop - this.startOffsetY < this.minSize &&
      this.currentResize === this.sideValue.bottom
    )
      return this.minSize;
    if (
      newTop > this.$parentObject.state.height &&
      this.currentResize === this.sideValue.bottom
    )
      return this.$parentObject.state.height - this.startOffsetY;

    return this.currentResize === this.sideValue.bottom
      ? newTop - this.startOffsetY
      : offsetHeightOnStartStratch - newTop;
  }
  doResizeLeft(newLeft, newWidth) {
    this.changeLeft(newLeft);
    this.changeWidth(newWidth);
  }
  doResizeRight(newWidth) {
    this.changeWidth(newWidth);
  }
  doResizeTop(newTop, newHeight) {
    this.changeTop(newTop);
    this.changeHeight(newHeight);
  }
  doResizeBottom(newHeight) {
    this.changeHeight(newHeight);
  }
  moveHandler(e) {
    const newLeft = e.clientX - this.$parentObject.offsetLeft - this.startX;
    const newTop = e.clientY - this.$parentObject.offsetTop - this.startY;

    if (this.checkMovePositionLeft(newLeft, this.actualWidth, this.action.move))
      this.changeLeft(newLeft);
    if (this.checkMovePositionTop(newTop, this.actualHeight, this.action.move))
      this.changeTop(newTop);
  }
  checkMovePositionLeft(newLeft, width) {
    if (newLeft < 0) {
      this.changeLeft(0);
      return false;
    } else if (newLeft + width > this.$parentObject.state.width) {
      this.changeLeft(this.$parentObject.state.width - width);
      return false;
    } else return true;
  }
  checkMovePositionTop(newTop, height) {
    if (newTop < 0) {
      this.changeTop(0);
      return false;
    } else if (newTop + height > this.$parentObject.state.height) {
      this.changeTop(this.$parentObject.state.height - height);
      return false;
    } else return true;
  }
}

const element = new Draggable("mainBlock");
element.init(50, 4);
