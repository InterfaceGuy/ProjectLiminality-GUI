/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-this-in-sfc */
import { SpaceContext } from '@contexts/SpaceContext'
import styles from '@styles/pages/SpacePage/CirclePacking.module.scss'
import * as d3 from 'd3'
import React, { useContext, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'

const CirclePacking = (props: { spaceMapData: any; params: any }): JSX.Element => {
    const { spaceMapData, params } = props
    const { spaceData, setSpaceMapData, getSpaceMapChildren } = useContext(SpaceContext)
    const history = useHistory()
    const { sortBy, sortOrder } = params
    const transitionDuration = 1000
    const circleRadius = useRef(0)
    const transitioning = useRef(false)
    const parentNodes = useRef<any>(null)
    const childNodes = useRef<any>(null)

    const zoom = d3.zoom().on('zoom', () => {
        d3.select('#master-group').attr('transform', d3.event.transform)
        // scale circle and text attributes
        const scale = d3.event.transform.k
        d3.selectAll('.circle').attr('stroke-width', 1 / scale)
        d3.selectAll('.text')
            .attr('font-size', 16 / scale)
            .attr('y', (d) => d.y - d.r - 15 / scale)
            .attr('opacity', (d) => {
                if (scale > 7) return 1
                return d.r > 30 / scale ? 1 : 0
            })
    })

    const colorScale = d3
        .scaleLinear()
        .domain([0, 5])
        .range(['hsl(152,80%,80%)', 'hsl(228,30%,40%)'])
        .interpolate(d3.interpolateHcl)

    function resetPosition(duration) {
        const svg = d3.select('#circle-packing-svg')
        const svgWidth = parseInt(svg.style('width'), 10)
        const svgHeight = parseInt(svg.style('height'), 10)
        const x = svgWidth / 2 - circleRadius.current
        const y = svgHeight / 2 - circleRadius.current
        const hasParents =
            spaceMapData.DirectParentSpaces && spaceMapData.DirectParentSpaces.length > 0
        const yOffset = hasParents ? 50 : 0
        svg.transition()
            .duration(duration)
            .call(zoom.transform, d3.zoomIdentity.translate(x, y + yOffset))
    }

    function buildCanvas() {
        const svg = d3
            .select('#canvas')
            .append('svg')
            .attr('id', 'circle-packing-svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .style('display', 'block')
            .on('click', () => resetPosition(transitionDuration))
        circleRadius.current = parseInt(svg.style('height'), 10) / 2 - 80
        // const yOffset = spaceData.DirectParentSpaces.length ? 180 : 80
        const masterGroup = svg.append('g').attr('id', 'master-group')
        masterGroup
            .append('g')
            .attr('id', 'parent-circle-group')
            .attr('transform', `translate(${circleRadius.current},-200)`)
        masterGroup.append('g').attr('id', 'circle-group')
        // .attr('transform', `translate(0,${yOffset})`)
        svg.call(zoom)
    }

    function onCircleClick(circle) {
        d3.event.stopPropagation()
        transitioning.current = true
        // if main circle, reset position
        if (circle.data.id === childNodes.current[0].data.id) resetPosition(transitionDuration)
        // else, navigate to new space
        else history.push(`/s/${circle.data.handle}/spaces`)
    }

    function createParentCircles() {
        d3.select('#parent-circle-group')
            .selectAll('.parent-circle')
            .data(parentNodes.current)
            .join('circle')
            .classed('parent-circle', true)
            .attr('r', 25)
            .attr('stroke', '#000')
            .attr('stroke-width', 1)
            .attr('cursor', 'pointer')
            .attr('transform', (d) => `translate(${d.x},${d.y})`)
            .attr('fill', (d) => colorScale(d.depth + 1))
            .on('click', (d) => onCircleClick(d))
            .transition()
            .duration(transitionDuration)
            .attr('opacity', 1)
    }

    function createParentCircleText() {
        d3.select('#parent-circle-group')
            .selectAll('.parent-text')
            .data(parentNodes.current)
            .join('text')
            .classed('parent-text', true)
            .text((d) => d.data.name)
            .attr('font-size', 16)
            .attr('pointer-events', 'none')
            .attr('opacity', 1)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('y', (d) => d.y - 40)
            .attr('x', (d) => d.x)
    }

    function createCircles() {
        d3.select('#circle-group')
            .selectAll('.circle')
            .data(childNodes.current, (d) => d.data.id)
            .join(
                (enter) =>
                    enter
                        .append('circle')
                        .classed('circle', true)
                        .attr('r', (d) => d.r)
                        .attr('stroke', '#000')
                        .attr('stroke-width', 1)
                        .attr('cursor', 'pointer')
                        .attr('transform', (d) => `translate(${d.x},${d.y})`)
                        .attr('fill', (d) => colorScale(d.depth + 1))
                        .on('click', (d) => onCircleClick(d))
                        .call((node) =>
                            node.transition().duration(transitionDuration).attr('opacity', 1)
                        ),
                (update) =>
                    update.call((node) =>
                        node
                            .transition()
                            .duration(transitionDuration)
                            .attr('r', (d) => d.r)
                            .attr('fill', (d) => colorScale(d.depth + 1))
                            .attr('transform', (d) => `translate(${d.x},${d.y})`)
                    ),
                (exit) =>
                    exit.call((node) =>
                        node
                            .transition()
                            .duration(transitionDuration / 2)
                            .attr('opacity', 0)
                            .remove()
                    )
            )
    }

    function createCircleText() {
        d3.select('#circle-group')
            .selectAll('.text')
            .data(childNodes.current, (d) => d.data.id)
            .join(
                (enter) =>
                    enter
                        .append('text')
                        .classed('text', true)
                        .text((d) => d.data.name)
                        .attr('font-size', 16)
                        .attr('pointer-events', 'none')
                        .attr('opacity', 0)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'central')
                        .attr('y', (d) => d.y - d.r - 15)
                        .attr('x', (d) => d.x)
                        .call((node) =>
                            node
                                .transition()
                                .duration(transitionDuration)
                                .attr('opacity', (d) => (d.r > 30 ? 1 : 0))
                        ),
                (update) =>
                    update.call((node) =>
                        node
                            .transition()
                            .duration(transitionDuration)
                            .attr('y', (d) => d.y - d.r - 15)
                            .attr('x', (d) => d.x)
                            .attr('opacity', (d) => (d.r > 30 ? 1 : 0))
                    ),
                (exit) =>
                    exit.call((node) =>
                        node
                            .transition()
                            .duration(transitionDuration / 2)
                            .attr('opacity', 0)
                            .remove()
                    )
            )
    }

    function buildNodeTree() {
        // build parent nodes
        const parents = d3.hierarchy(spaceMapData, (d) => d.DirectParentSpaces)
        const newParentNodes = d3
            .tree()
            .nodeSize([50, 130])
            .separation(() => 2)(parents)
            .descendants()
            .slice(1)
        // build child nodes
        const hierarchy = d3
            .hierarchy(spaceMapData)
            .sum((d) => d.totalLikes || 1)
            .sort((a, b) => b.totalLikes - a.totalLikes)
        const newChildNodes = d3
            .pack()
            .size([circleRadius.current * 2, circleRadius.current * 2])
            .padding(30)(hierarchy)
            .descendants()
        // todo: update UUIDs
        // todo: zoom to new space
        parentNodes.current = newParentNodes
        childNodes.current = newChildNodes
    }

    function buildTree() {
        resetPosition(childNodes.current ? transitionDuration : 0)
        buildNodeTree()
        createParentCircles()
        createParentCircleText()
        createCircles()
        createCircleText()
    }

    useEffect(() => buildCanvas(), [])

    useEffect(() => {
        if (spaceMapData.id) buildTree()
    }, [spaceMapData])

    return <div id='canvas' className={styles.canvas} />
}

export default CirclePacking

// function hasMatchingAncestor(circle, selectedCircle) {
//     // recursively check parents for selectedCircle
//     if (!circle.parent) return false
//     if (circle.parent.data.id === selectedCircle.data.id) return true
//     return hasMatchingAncestor(circle.parent, selectedCircle)
// }

// // zoom to new circle
// const svg = d3.select('#circle-packing-svg')
// const svgWidth = parseInt(svg.style('width'), 10)
// const svgHeight = parseInt(svg.style('height'), 10)
// const scale = (circleRadius.current * 2) / (circle.r * 2)
// const x = svgWidth / 2 / scale - circle.x
// const y = svgHeight / 2 / scale - circle.y + 50
// // transition circle stroke width
// d3.selectAll('.circle')
//     .transition('circle-transition')
//     .duration(transitionDuration)
//     .attr('stroke-width', 1 / scale)
// // transition font size
// d3.selectAll('.text')
//     .transition('text-transition')
//     .duration(transitionDuration)
//     .attr('font-size', 16 / scale)
//     .attr('y', (da) => da.y - da.r - 15 / scale)
// // fade out all external nodes
// d3.selectAll('.circle,.text')
//     .filter((d) => {
//         if (d.depth <= circle.depth && d.data.id !== circle.data.id) return true
//         return d.data.id !== circle.data.id && !hasMatchingAncestor(d, circle)
//     })
//     .transition('fade-transition')
//     .duration(transitionDuration)
//     .attr('opacity', 0.25)
// // // zoom master group
// svg.transition()
//     .duration(transitionDuration)
//     .call(zoom.transform, d3.zoomIdentity.scale(scale).translate(x, y))
//     .on('end', () => {
//         // buildTree(spaceMapData)
//         // transitioning.current = false
//     })
