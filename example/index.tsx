import React, { Component, createRef, RefObject } from 'react'
import ReactDOM from 'react-dom'
import ImageModal from 'react-vmage'
import data from './mock/images'
// import '../src/styles.less'
class Root extends Component<any, any> {
  private modal: RefObject<ImageModal> = createRef()
  render() {
    const { images } = this.props
    return (
      <div className="image-gallery">
        {images.map((item: any, index: number) => (
          <div className="image-item" key={index} onClick={this.open.bind(this, index)}>
            <div className="image-inner" style={{ background: `url(${item.src})` }} />
          </div>
        ))}
        <ImageModal images={images} showIndex showPreview ref={this.modal} />
      </div>
    )
  }
  open(index: number) {
    this.modal.current!.open(index)
  }
}

ReactDOM.render(<Root images={data} />, document.getElementById('app'))
