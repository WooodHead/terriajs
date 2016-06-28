'use strict';

/*global require, fail*/
import Chart from '../../lib/ReactViews/Custom/Chart/Chart';
// import ChartExpandButton from '../../lib/ReactViews/Custom/Chart/ChartExpandButton';
import Collapsible from '../../lib/ReactViews/Custom/Chart/Collapsible';
import parseCustomHtmlToReact from '../../lib/Models/parseCustomHtmlToReact';
import registerCustomComponentTypes from '../../lib/Models/registerCustomComponentTypes';
import Terria from '../../lib/Models/Terria';

import {findAllWithType, findAll} from 'react-shallow-testutils';

function findAllEqualTo(reactElement, text) {
    return findAll(reactElement, (element) => element && element === text);
}

describe('parseCustomHtmlToReact and registerCustomComponentTypes', function() {

    let terria;

    beforeEach(function() {
        terria = new Terria({
            baseUrl: './'
        });
        registerCustomComponentTypes(terria);
    });

    it('parses a div', function() {
        const result = parseCustomHtmlToReact('<div>Foo</div>');
        expect(result.type).toEqual('div');
		// This is a bit cheeky - using the shallow test utils to test a fully rendered div.
		// Do it because html-to-react often inserts undefineds into children, so you don't know which child will be the one you want.
		// eg. expect(result.props.children[0]).toEqual('Foo'); should work, but it's actually children[1] that equals 'Foo'.
        expect(findAllEqualTo(result, 'Foo').length).toEqual(1);
    });

    it('parses a collapsible', function() {
        const result = parseCustomHtmlToReact('<collapsible title="Untitled">Bar</collapsible>');
        expect(result.props.title).toEqual('Untitled');
        expect(result.type).toEqual(Collapsible);
        expect(result.props.children[0]).toEqual('Bar');
    });

    it('parses a chart with a src attribute', function() {
        const result = parseCustomHtmlToReact('<chart src="http://example.com"></chart>');
        const charts = findAllWithType(result, Chart);
        expect(charts.length).toEqual(1);
        const chart = charts[0];
        expect(chart.props.url).toEqual('http://example.com');
    });

    it('parses a chart with a data attribute containing csv', function() {
        // Both line feeds (\n) and backslash-n ("\n" or \\n here) work.
        const result = parseCustomHtmlToReact('<chart data="x,y\n1,2\\n3,4\n5,6"></chart>');
        const charts = findAllWithType(result, Chart);
        expect(charts.length).toEqual(1);
        const chart = charts[0];
        expect(chart.props.tableStructure).toBeDefined();
        expect(chart.props.tableStructure.columns.length).toEqual(2);
        expect(chart.props.tableStructure.columns[1].values.length).toEqual(3);
    });

    it('parses a chart with a data attribute containing json', function() {
        // Use &quot; for quotes.
        const result = parseCustomHtmlToReact('<chart data="[[&quot;x&quot;,&quot;y&quot;,&quot;z&quot;],[1,10,3],[2,15,9],[3,8,12],[5,25,4]]"></chart>');
        const charts = findAllWithType(result, Chart);
        expect(charts.length).toEqual(1);
        const chart = charts[0];
        expect(chart.props.tableStructure).toBeDefined();
        expect(chart.props.tableStructure.columns.length).toEqual(3);
        expect(chart.props.tableStructure.columns[2].values.length).toEqual(4);
    });

    it('parses a chart with child csv', function() {
        // Both line feeds (\n) and backslash-n ("\n" or \\n here) work.
        const result = parseCustomHtmlToReact('<chart>x,y\n1,2\\n3,4\n5,6</chart>');
        const charts = findAllWithType(result, Chart);
        expect(charts.length).toEqual(1);
        const chart = charts[0];
        expect(chart.props.tableStructure).toBeDefined();
        expect(chart.props.tableStructure.columns.length).toEqual(2);
        expect(chart.props.tableStructure.columns[1].values.length).toEqual(3);
    });

    it('parses a chart with child json', function() {
        // This is nicer, as you can use real quotes.
        const result = parseCustomHtmlToReact('<chart>[["x","y","z"],[1,10,3],[2,15,9],[3,8,12],[5,25,4]]</chart>');
        const charts = findAllWithType(result, Chart);
        expect(charts.length).toEqual(1);
        const chart = charts[0];
        expect(chart.props.tableStructure).toBeDefined();
        expect(chart.props.tableStructure.columns.length).toEqual(3);
        expect(chart.props.tableStructure.columns[2].values.length).toEqual(4);
    });

    // TODO: add tests for badly formed data strings.

});
