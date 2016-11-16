# Summary

The  [ Programme for International Student Assessment (PISA)](https://en.wikipedia.org/wiki/Programme_for_International_Student_Assessment) is a worldwide study of 15-year-old school pupils&#39; scholastic performance on mathematics, science, and reading. In 2012 students from 65 countries and economies took part in the program.

In PISA dataset for every student there is information about her test scores in Math, Reading and Science along with many factors related to personal, economical, social and other factors.

The main goal of the project was to explore differences and gaps in test scores between students and focus on a problem of low performing students. A student is assumed to be low performer in a subject if she has test score below the baseline Level 2 of proficiency, this baseline level is determined by PISA separately for each subject (http://www.oecd.org/pisa/aboutpisa/PISA%20scales%20for%20pisa-based%20test%20for%20schools.pdf).

I was trying to look at the problem from different sides and provide explanatory  visualizations along with exploratory tools. Each visualization has some introduction comments at the top of the page and &quot;Notes&quot; section with some technical detail at the bottom of the page.

There are three visualizations in the project:

_Performance Comparison_

This visualization shows distribution of test scores in Math, Reading and Science for different countries and economies. Note that 10% of extreme cases were removed (scores below 5% percentile and above 95% percentile).  For more advanced analysis one can try different sort options:

 * Sort by Performance Score Gap

   First come countries and economies, which have the lowest difference between students&#39; test results (measured in score points).

 * Sort by Country GDP

   For some countries or economies GDP was not available, so they are just hidden in this case.

_Low Performance_

This visualization compares percent of low performers in different countries and economies. It classifies low performance in 3 groups: in all subjects; in one or two including Math; Other.

_Low Performance Likelihood_

Last visualization is related to more advance analysis of different risk factors which may influence the likelihood of becoming low performer in Math. Since most low performing  students have difficulties with Math, focusing on this particular subject makes sense.

Risk factors were determined from the common practice and stereotypes. As example, factors like immigration status or disadvantaged social status are considered. However, in some countries determined risk factor can have actually positive effect and decrease the likelihood of becoming a low performer.

# Design

**Initial design**

_Performance Comparison_

In this visualization I decided to compare not only aggregated statistics of test performance (like median or average), but also distribution of test scores for different countries and economies. Here I was thinking about Box-and-Whisker chart and how to show in friendlier way. I decided to use two nested bars with different color intensity. Light bar shows the range of test scores for 90% of students. The second bar shows score range for middle 50% of students(interquartile range). Median is also shown as a line inside the bars.

_Low Performance_

Here I finally decided to show simple stacked bar chart, sorted from the highest to lowest. The whole bar shows percent of low performers at least in one subject. Since bar chart is sorted and sum of stacked bars have meaning, this chart should be easy for reading (which is not always true for stacked bar charts)

Each bar is separated by color into 3 portions: percent of low performers in all subjects; in or two, including Math; other.

This chart should help to highlight three points:

- There are high differences between countries related to percent of low performers.
- A big part (nearly half) of low performers have difficulties with all subjects
- Most of those, who are not low performers in all three subjects, have difficulties with Math.

_Low Performance Likelihood_

In this visualization for each country (or economy) and for each factor I need to show one continuous value. I decided to use a heat map in order to have very compact visualization of all countries and factors. However, heat map gives only very general picture, so in addition I added a dynamic bar chart at the right panel. It shows average value for each factor and it dynamically changes when one hover over a particular element in the heat map. This bar chart should help to explore details.

**Changes after feedback**

After getting feedback the following problems and suggestions were pointed out:

 **1.** _Missing GDP for some countries. Some countries are not actually countries, but local regions (for example, Florida(USA), Perm(Russian Federation))_

Some states in US and Perm in RF took part in PISA separately. I decided to leave the data as it is.

I have  changed the title and used &quot;Countries and Economies&quot; instead. I have added clarification note about these cases and about not showing some bars in GDP sorting.

 **2.** _Misleading legend in Performance Comparison visualization_

In &quot;Performance Comparison&quot; I use nested bars in order to show distribution of test scores, but legend was misleading and shown range 75%-95% and 5%-25% separately. I changed the legend, so it was consistent with nested bars concept and also with data in tooptips.

 **3.** _Add some reference levels corresponding to test performance, GDP and performance gap (probably country medians or other percentiles)._

I have added country median for test performance as a line.

I labeled areas of performance gap values (three areas: lower 25% countries, middle 50% countries, upper 25% countried). It is shown only when &quot;Sort by Performance Score Gap&quot; is selected.

I have highlighted low GDP countries (GDP below $20 000). It is shown only when &quot;Sort by GDP&quot; is selected.

 **4.** _Misleading tooltips in Performance Comparison visualization._

I have changed data shown in tooltips, so now it has the name of particular range (50% range or 90% range), I also added GDP value.

 **5.** _It is not obvious what values are shown in the heat map in Low Performance Likelihood visualization._

I have extended explanation section and added some examples.

 **6.** _In the heat map some elements have very close colors, but underlying elements have different sign._

Use of colorblind-friendly palette solved this problem, making even light colors look different.

 **7.** _Dynamic x-axis in Low Performance Likelihood visualization can be misleading in some cases._

I have fixed the error which caused this inconsistency in axis.

 **8.** _On a small screen some sections overlap_

In order to prevent overlapping I have added style &quot;overflow: auto&quot; to specific container elements.

 **9.** _Heat map does not use colorblind-friendly palette._

I have changed color palette to colorblind-friendly.

 **10.** _In Low Performance Likelihood visualization y-axis (risk factors) are places on the right side, this is not natural for most people._

Initially I had y-axis on the left side, it is more natural for me as well. When I added the right panel with a bar chart, I decided to use one y-axis for both charts on the right side. So I did not changed anything here.

 **11.** _Add explanatory elements_

I have added explanatory elements to Performance Comparison and made the dynamically change depending on the selected subject (Math, Reading or Science) and sorting.

I have added comments to Low Performance visualizations.

I have extended explanation for Low Performance Likelihood visualization.

 **12.** _Reference to the year of schooling is not explained_

I have added link to PISA report in Notes section.

 **13.** _Errors in comments related to performance gap values_

Automated generation of chart comments solved this problem.

 **14.** Tooltips in Low Performers visualization are difficult for reading and interpretation since only data relevant to hovered bars is shown.

I have changed tooltips so that all data is shown at the same time.

In addition, I added some common abbreviations for country names (like USA or UAE), it helped to save some space. Relevant explanation was added to Notes section.

# Feedback

**laxmsun (https://discussions.udacity.com/t/feedback-for-pisa-visualization/198217)**

Very well done!. How long did it take for you to finish this?

I noticed that high GDP doesn&#39;t necessarily correlate with high math, science, and or reading scores. I&#39;ve also noticed that some &#39;countries&#39; don&#39;t have GDP data: Florida, Massachusetts, and Connecticut; these are states within USA. Should the viewer assume that data point for USA has excluded these 3 states? The same goes for Perm(Russian federation)

Since you seem to be using a sequential color scheme, you may want to use a darker shade of blue for the range from 75%-95%. Currently it is identical to the 5%-25% range.

When I hover over a particular bar, I see that the range changes for the middle 50% vis-a-vis the overall range for that country. In my view, this should reflect the overall range in scores for a subject for that country. Also, for the metric: Performance by GDP, the tool tip doesn&#39;t show the GDP for that country.

Currently, you mention only the extreme countries with respect to performance score, but it would be nice to see the median country with respect to 3 metric, performance by median score, score gap, and GDP to get a sense of where the viewers&#39; country stands (assuming it is in the data) with respect to the median and the extreme countries.

In the Low performance likelihood tab, I see that you&#39;ve used a heat map to display the coefficients of the various risk indicators. In my view, a heat map may not be the right chart type, as both the x-axis and y-axis labels are categorical - changing the order of the labels changes the position of the values. Maybe you could order the risk factors by average probability of good or bad performance, and plot probabilities of performance of various countries.

In the heat map, I noticed some inconsistencies. For example, when I hover over USA, to my eye, risk factors &#39;Immigrant background&#39; and &#39;Rural school location&#39; have the same shade, yet the position of the bars are in opposite directions. Also, the ticks doesn&#39;t show up for some countries. Example, &#39;Public school&#39; risk factor for Chinese Taipei shows a &#39;positive effect&#39;, yet the negative tick on the x-axis doesn&#39;t show up. Also, it would be nice to tell your audience, the logic you&#39;ve used to derive the 2 levels for each of the risk factors.

Overall, I liked your detailed viewer driven visual. Nice work, again!

**CtrlAltDel (** [**https://discussions.udacity.com/t/feedback-for-pisa-visualization/198217/3)**](https://discussions.udacity.com/t/feedback-for-pisa-visualization/198217/3))

Hi  [**@toma.makarova**](https://discussions.udacity.com/users/toma.makarova),

This is a very detailed visualization. It&#39;s very clear that a lot of thought and effort was put into this and the result is impressive. Strong elements of this visualization include:

- the overall level of detail
- the narrative for each view
- that navigation buttons that can be used to go from one visualization to the next
- the toggle buttons for countries
- the sorting radio buttons
- the compelling subject matter

[**@laxmsun**](https://discussions.udacity.com/users/laxmsun) has made some great and insightful comments. I have some additional comments to consider.

- I&#39;m viewing this on a small netbook screen so some comments may not be as relevant, but on my screen
  - the countries toggle in the first two visualizations overlaps with the chart
  - On the low performance tab the countries toggle also overlaps with the legend.
- For the heatmap, please make sure that a colorblind palette is used. Blue and green may be difficult to discern for those with blue/green color blindness.
- For the heatmap consider placing the risk factor on the left side. That way when the user will see the risk factor first when scanning from left to right. This is a judgement call and it may differ depending on the language of the viewer, but many viewers will be scanning from left to right.
- It&#39;s clear that a lot of effort was putting into making this visualization easily explorable, and it has really paid off (it is very easy to explore). For P6 it is critical that the visualization be explanatory in nature. The current state is more exploratory, so it would be good to consider ways in which the explanatory nature could be enhanced. One way to do this is to emphasize the main points from the narrative, in the visualization. For example an initial view could be presented to the viewer that shows elements of this statement:

Difference between score medians for best performing China-Shanghai and worst performing Qatar is 261 score points (72%). This difference is roughly equivalent to 6 years of schooling. In reading the difference is 192 points (50%, Peru vs China-Shanghai) and in science it is 252 points (68%, Peru vs China-Shanghai).

That is toggle the countries in such a way that the main points are immediately brought out to the reader. Alternatively all countries could be toggled on, as they currently are, but the main point could be highlighted in some way (this is pre-attentive processing).

For the low performance visualization the statement is made:

Among low performing students nearly a half perform low in all three subjects. Those students who perform low in one or two subjects mostly have difficulties with math.

This could be enhanced for the viewer by providing a 20% cutoff line that helps them see which countries these are.

These are just some general thoughts, please feel free to enhance the explanatory nature in whatever way seems best.

Again, awesome work. I can&#39;t wait to see the next iteration!

**Anastasia Klein**

Anastasia asked the following questions:

- Why difference between Peru and China-Shanghai is 252? Tooltips show different values.
- How number of years of schooling is estimated?
- When data is sorted by GDP, why some countries are not shown?
- What do results for Florida(USA) or Perm (Russian Federation) mean?
- Tooltips in Low Performers visualization are difficult for reading, it may be better to show all values at the same time.

# Resources

[https://github.com/d3/d3/wiki/Gallery](https://github.com/d3/d3/wiki/Gallery)

[https://github.com/d3/d3/wiki](https://github.com/d3/d3/wiki)
