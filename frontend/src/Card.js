import React from 'react';
import { Image, Card, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const grid = {
    width: "4rem",
    minHeight: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
}

const box = {
    width: '200px',
    height: '200px',
};

function RenderCards(props) {

    const cards = props.productData.map((product, index) => {
        return (
        <Row className="g-4">
            {Array.from({ length: 1 }).map((_, idx) => (
            <Col>
                <Card key={index} className="box">
                    <Card.Img style = {box} variant="top" src="holder.js/250x250" src={product.image}/>
                    <Card.Body>
                        <Card.Header>{product.title}</Card.Header>
                        <Card.Text>{product.description}</Card.Text>
                    </Card.Body>
                </Card>
            </Col>
            ))}
        </Row>
        );
    });

    return (
        <div>
            {cards}
        </div>
    );
}

function Cards(props) {
    return (
        <div style = {grid}>
            <RenderCards productData = {props.productData} />
        </div>
    );
}
    

export default Cards;