// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import React, { Component, createRef, RefObject } from 'react'
import { OFFSET_DEFAULT, ZOOM_LEVEL } from './utils/contants'

export interface Image {
  src: string
  // Caption => {title} - {content}
  title?: string
  content?: string
}

interface Offset {
  x: number
  y: number
}

interface ImageWrapperProps {
  image: Image
  showIndex: boolean
  index?: string
}

interface ImageWrapperState {
  loading: boolean
  onload: boolean
  offset: Offset
  zoom: number
}

export default class ImageWrapper extends Component<ImageWrapperProps, ImageWrapperState> {
  private imageOuter: RefObject<HTMLDivElement>
  private image: RefObject<HTMLImageElement>
  private draggable: boolean
  private src: any
  private clientOffset: Offset
  private offsetRange: Offset
  private mounted: boolean
  constructor(props: ImageWrapperProps, context: any) {
    super(props, context)
    this.state = {
      loading: false,
      onload: false,
      offset: OFFSET_DEFAULT,
      zoom: 0
    }
    this.imageOuter = createRef()
    this.image = createRef()
    this.draggable = false
    this.mounted = false
    this.offsetRange = OFFSET_DEFAULT
    this.clientOffset = { x: 0, y: 0 }
  }

  private loadImage(src: string) {
    this.setState({ loading: true })
    this.src = new Image()
    this.src.src = src
    this.src.onload = () => {
      if (!this.src) return
      this.setState({ loading: false, onload: true })
    }
    this.src.onerror = () => {
      if (!this.src) return
      this.setState({ loading: false, onload: false })
    }
  }

  private resetOffset() {
    this.setState({ offset: OFFSET_DEFAULT })
  }

  private setOffsetRange() {
    const zoom: number = this.state.zoom
    const dx: number =
      this.image.current!.scrollWidth * (1 + zoom / 2) - this.imageOuter.current!.clientWidth
    const dy: number =
      this.image.current!.scrollHeight * (1 + zoom / 2) - this.imageOuter.current!.clientHeight
    this.offsetRange = {
      x: Math.max(0, dx / 2),
      y: Math.max(0, dy / 2)
    }
  }

  private zoomIn() {
    if (!this.state.onload) return
    const zoom = Math.min(this.state.zoom + 1, ZOOM_LEVEL.MAX)
    this.setState({ zoom })
    this.setOffsetRange()
  }

  private zoomOut() {
    if (!this.state.onload) return
    const zoom = Math.max(0, this.state.zoom - 1)
    this.setState({ zoom })
    this.resetOffset()
    this.setOffsetRange()
  }

  private onMoveStart(e: any) {
    if (!this.offsetRange.x && !this.offsetRange.y) {
      return
    }

    this.clientOffset = {
      x: e.clientX,
      y: e.clientY
    }
    this.draggable = true
  }

  private onMove(e: any) {
    if ((!e.clientX && !e.clientY) || !this.draggable) {
      return
    }

    const offset: Offset = {
      x: e.clientX - this.clientOffset!.x,
      y: e.clientY - this.clientOffset!.y
    }

    this.clientOffset = {
      x: e.clientX,
      y: e.clientY
    }

    const offsetState = {
      x: this.state.offset.x + offset.x,
      y: this.state.offset.y + offset.y
    }
    this.setState({ offset: offsetState })
  }

  private onMoveEnd(e: any) {
    if (!this.mounted) return

    this.draggable = false
    const offset: Offset = {
      x: Math.abs(this.state.offset.x),
      y: Math.abs(this.state.offset.y)
    }

    if (Math.abs(this.state.offset.x) >= this.offsetRange.x) {
      this.state.offset.x =
        this.state.offset.x < 0 ? Math.min(0, -this.offsetRange.x) : Math.max(0, this.offsetRange.x)
      this.setState(this.state)
    }

    if (Math.abs(this.state.offset.y) >= this.offsetRange.y) {
      this.state.offset.y =
        this.state.offset.y < 0 ? Math.min(0, -this.offsetRange.y) : Math.max(0, this.offsetRange.y)
      this.setState(this.state)
    }
  }

  componentWillReceiveProps(nextProps: any) {
    if (this.props.image.src !== nextProps.image.src) {
      this.resetOffset()
      this.loadImage(nextProps.image.src)
      this.setState({
        zoom: 0
      })
    }
  }

  componentDidMount() {
    this.mounted = true
    this.loadImage(this.props.image.src)
    window.addEventListener('resize', this.setOffsetRange.bind(this))
    document.documentElement.addEventListener('mouseup', this.onMoveEnd.bind(this))
  }

  componentWillUnmount() {
    this.mounted = false
    if (this.src) {
      this.src = undefined
    }
    window.removeEventListener('resize', this.setOffsetRange.bind(this))
    document.documentElement.removeEventListener('mouseup', this.onMoveEnd.bind(this))
  }

  render() {
    const { image, index, showIndex } = this.props

    const { offset, zoom, loading } = this.state
    const value: string = `translate3d(${offset.x}px, ${offset.y}px, 0px)`
    const imageCls: string = `zoom-${zoom} image-outer ${this.draggable ? 'dragging' : ''}`
    const caption: any = (
      <p className="caption">
        {image.title ? <span className="title">{image.title}</span> : null}
        {image.title && image.content ? <span>{` - `}</span> : null}
        {image.title ? <span className="content">{image.content}</span> : null}
      </p>
    )
    return (
      <div className="image-wrapper">
        <div style={{ transform: value }} ref={this.imageOuter} className={imageCls}>
          {loading ? (
            <div className="spinner">
              <div className="bounce"></div>
            </div>
          ) : (
            <img
              className="image"
              ref={this.image}
              src={image.src}
              alt={image.title || ''}
              draggable={false}
              onDragStart={(e: any) => e.preventDefault()}
              onMouseMove={this.onMove.bind(this)}
              onMouseDown={this.onMoveStart.bind(this)}
              onMouseUp={this.onMoveEnd.bind(this)}
            />
          )}
        </div>
        <div className="tool-bar">
          {showIndex && <div className="index-indicator">{index}</div>}
          {caption}
          <div className="button-group">
            <div className="zoom-out button" onClick={this.zoomOut.bind(this)}></div>
            <div className="zoom-in button" onClick={this.zoomIn.bind(this)}></div>
          </div>
        </div>
      </div>
    )
  }
}
