import { Card, Col, Row } from 'antd'
import React from 'react'

const ImageCard = ({ photos, handlePhotoClick }) => {
    return (
        <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, { xs: 8, sm: 16, md: 24, lg: 32 }]} justify={'center'} align={'middle'}>
            {photos?.map((photo) => (
                <Col className="gutter-row">
                    <Card hoverable>
                        <div key={photo.id}>
                            <img
                                src={`https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`}
                                alt={photo.title}
                                onClick={() => handlePhotoClick(photo)}
                                width={200}
                                height={200}
                            />
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    )
}

export default ImageCard