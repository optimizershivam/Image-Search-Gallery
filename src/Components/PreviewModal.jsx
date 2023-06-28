import { Modal } from 'antd'
import React from 'react'

const PreviewModal = ({modalPhoto,modalIsOpen,closeModal}) => {
  return (
    <Modal
    title="Preview Image"
    centered
    open={modalIsOpen}
    onOk={closeModal}
    onCancel={closeModal}>
      {modalPhoto && (
        <img
          src={`https://live.staticflickr.com/${modalPhoto.server}/${modalPhoto.id}_${modalPhoto.secret}_c.jpg`}
          alt={modalPhoto.title}
          width="100%"
          height="100%"
        />
      )}
    </Modal>
  )
}

export default PreviewModal