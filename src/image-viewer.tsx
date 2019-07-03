import React, { Component, createRef, RefObject } from 'react'
import ImageWrapper, { Image } from './image-wrapper'
import { VISIBLE_INDICATORS_COUNT } from './utils/contants'

interface ImageViewerProps {
  images: Image[]
  activeIndex: number
  showIndex: boolean
  showPreview: boolean
  prefixCls: string
}

interface ImageViewerState {
  activeIndex: number
}

export default class ImageViewer extends Component<ImageViewerProps, ImageViewerState> {
  private container: RefObject<HTMLDivElement>
  private mounted: boolean

  static defaultProps = {
    prefixCls: 'react-image-viewer',
    className: '',
    showIndex: true,
    showPreview: true,
    activeIndex: 0
  }

  constructor(props: ImageViewerProps) {
    super(props)
    this.mounted = false
    this.container = createRef()
    this.state = {
      activeIndex: this.props.activeIndex
    }
  }

  private renderIndicators(list: Image[]) {
    const activeIndex: number = this.state.activeIndex
    const ret: number = Math.round(VISIBLE_INDICATORS_COUNT / 2)
    const length: number = list.length
    return list.map((item: Image, index: number) => {
      const isActive: boolean = activeIndex === index
      const itemInvisible: boolean =
        length > VISIBLE_INDICATORS_COUNT &&
        (index < Math.min(length - VISIBLE_INDICATORS_COUNT - 1, activeIndex - ret) ||
          index > Math.max(activeIndex + ret, VISIBLE_INDICATORS_COUNT))

      const itemCls: string = `indicators-item ${isActive ? 'active' : ''} ${
        itemInvisible ? 'invisible' : ''
      } ${this.props.showPreview ? 'preview' : ''}`

      return (
        <div key={index} className={itemCls} onClick={this.itemControl.bind(this, index)}>
          {this.props.showPreview && (
            <div className="image" style={{ background: `url(${item.src})` }}></div>
          )}
        </div>
      )
    })
  }

  private onPrev() {
    let index: number =
      (this.state.activeIndex + this.props.images.length - 1) % this.props.images.length
    this.itemControl(index)
  }

  private onNext() {
    let index: number = (this.state.activeIndex + 1) % this.props.images.length
    this.itemControl(index)
  }

  private itemControl(index: number) {
    if (index === this.state.activeIndex) return
    this.setState({ activeIndex: index })
  }

  private onKeyDown(e: KeyboardEvent) {
    if (!this.mounted) return
    e.stopPropagation()
    switch (e.which || e.keyCode) {
      // case KEY_CODE.LEFT:
      case 37:
        this.onPrev()
        break
      // case KEY_CODE.RIGTH:
      case 39:
        this.onNext()
        break
    }
  }

  componentDidMount() {
    this.mounted = true
    document.documentElement.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  componentWillUnmount() {
    this.mounted = false
    document.documentElement.removeEventListener('keydown', this.onKeyDown.bind(this))
  }

  render() {
    const { images, showIndex, prefixCls } = this.props
    const { activeIndex } = this.state
    const indicatorVisible: boolean = images.length > 1

    return (
      <div className={`react-image-viewer ${prefixCls}-image-viewer`} ref={this.container}>
        <ImageWrapper
          showIndex={showIndex}
          index={`${activeIndex + 1}/${images.length}`}
          image={images[activeIndex]}
        />
        {indicatorVisible ? (
          <div className="direction-control-button">
            <div className="prev-button button" onClick={this.onPrev.bind(this)}>
              <div className="bar"></div>
            </div>
            <div className="next-button button" onClick={this.onNext.bind(this)}>
              <div className="bar"></div>
            </div>
            <div className="indicators">{indicatorVisible && this.renderIndicators(images)}</div>
          </div>
        ) : null}
      </div>
    )
  }
}
