import { Modal, Tag, Button } from "antd";
import { MetricType } from "../../types/metric-type";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";
import { Metrics } from "../../api/api";
import { format } from "sql-formatter";
// @ts-ignore
import React, { FC } from "react";
import { colorMap } from "./MetricTable";

interface MetricDetailsProps {
  metric: MetricType;
  onclose: () => void;
}
const operatorDisplayMap = new Map<string, string>([
  ["eq", "="],
  ["isin", "is"],
  ["gt", ">"],
  ["gte", ">="],
  ["lt", "<"],
  ["lte", "<="],
  ["isnotin", "is not"],
]);

const MetricDetails: FC<MetricDetailsProps> = ({ metric, onclose }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    (metric_id: string) => Metrics.archiveMetric(metric_id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("metric_list");
        toast.success("Metric archived");
        onclose();
      },

      onError: (error: any) => {
        console.log(error);
        toast.error(error.response.data.detail);
      },
    }
  );
  return (
    <Modal
      visible
      title={<b> {metric?.metric_name ? metric.metric_name : "Metric"} </b>}
      footer={[
        <Button
          key="submit"
          type="default"
          onClick={() => {
            mutation.mutate(metric.metric_id);
          }}
        >
          Archive
        </Button>,
        <Button key="submit" type="default" onClick={onclose}>
          Close
        </Button>,
      ]}
      cancelText="Close"
      width={800}
      onCancel={onclose}
    >
      <div className="py-4 px-8 rounded-lg bg-[#FFFFFF]  border-2 border-solid  border-[#EAEAEB]">
        {metric.metric_type === "custom" ? (
          <div className="flex flex-col">
            {/* {format(metric.custom_sql, { language: "mysql" })} */}
            {metric.custom_sql}
          </div>
        ) : (
          <div className="py-4 grid grid-cols-2 items-start justify-between ">
            <p>
              <b className="mr-2">Event Name:</b> {metric.event_name}
            </p>
            <p>
              <b className="mr-2">Cost Metric:</b>{" "}
              {metric.is_cost_metric ? "Yes" : "No"}
            </p>
            <p>
              <b className="mr-2">Property Name:</b>{" "}
              {metric.property_name ?? "N/A"}
            </p>
            <p>
              <b className="mr-2">Metric Type:</b>
              {metric.metric_type === "gauge" ? "gauge" : metric.metric_type}
            </p>
            <p>
              <b className="mr-2">Per Time Unit:</b>{" "}
              {metric.granularity === "total" ? "none" : metric.granularity}
            </p>
            <p>
              <b className="mr-2">Proration:</b>{" "}
              {metric.proration === "total" || metric.proration == undefined
                ? "none"
                : metric.proration}
            </p>
            <p>
              <b className="mr-2">Usage Aggregation Type:</b>
              <Tag color={colorMap.get(metric.usage_aggregation_type)}>
                {metric.usage_aggregation_type}
              </Tag>
            </p>
            {metric.metric_type === "rate" && (
              <p>
                <b className="mr-2">Aggregation Type:</b>
                {!!metric.billable_aggregation_type ? (
                  <Tag>{metric.billable_aggregation_type}</Tag>
                ) : (
                  "N/A"
                )}
              </p>
            )}
            {metric.metric_type === "gauge" && (
              <p>
                <b className="mr-2">Event Type:</b>
                {!!metric.event_type ? <Tag>{metric.event_type}</Tag> : "N/A"}
              </p>
            )}

            <p>
              <b className="mr-2">Filters:</b>
            </p>
            <div className="grid col-span-2">
              <div>
                {metric.numeric_filters?.map((filter, index) => (
                  <Tag color="" key={filter.property_name}>
                    {<b>{filter.property_name}</b>}{" "}
                    {operatorDisplayMap.get(filter.operator)} {'"'}
                    {'"'}
                    {filter.comparison_value}
                    {'"'}
                  </Tag>
                ))}
              </div>

              <div>
                {metric.categorical_filters?.map((filter, index) => (
                  <Tag color="" key={filter.property_name}>
                    {<b>{filter.property_name}</b>}{" "}
                    {operatorDisplayMap.get(filter.operator)} {'"'}
                    {filter.comparison_value}
                    {'"'}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MetricDetails;
